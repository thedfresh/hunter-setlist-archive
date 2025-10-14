"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { getPerformerCardClass } from "@/lib/utils/performerStyles";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import EventMetadataForm from "@/components/admin/EventMetadataForm";
import EventMusiciansSection from "@/components/admin/EventMusiciansSection";
import EventContributorsSection from "@/components/admin/EventContributorsSection";
import RecordingsSection from "@/components/admin/RecordingsSection";
import ShowBanterSection from "@/components/admin/ShowBanterSection";
import SetsSection from "@/components/admin/SetsSection";

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventSlug = params.id as string;

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<any>(null);
    const [eventIdNumeric, setEventIdNumeric] = useState<number | null>(null);
    const [prevEvent, setPrevEvent] = useState<any>(null);
    const [nextEvent, setNextEvent] = useState<any>(null);
    const [navLoading, setNavLoading] = useState(true);

    useEffect(() => {
        loadEventData();
    }, [eventSlug]);

    useEffect(() => {
        if (eventIdNumeric) {
            loadNavigation();
        }
    }, [eventIdNumeric]);

    async function loadEventData() {
        try {
            const eventIdToFetch = eventIdNumeric || eventSlug;
            const res = await fetch(`/api/admin/events/${eventIdToFetch}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load event");

            const e = data.event;
            setEvent(e);
            setEventIdNumeric(e.id);
        } catch (err: any) {
            console.error(err.message || "Failed to load event");
        } finally {
            setLoading(false);
        }
    }

    async function loadNavigation() {
        if (!eventIdNumeric) return;

        setNavLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventIdNumeric}/navigation`);
            if (!res.ok) {
                console.error("Navigation API failed:", res.status);
                throw new Error();
            }
            const data = await res.json();
            setPrevEvent(data.prevEvent);
            setNextEvent(data.nextEvent);
        } catch (err) {
            console.error("Failed to load navigation", err);
        } finally {
            setNavLoading(false);
        }
    }

    const handlePrevClick = () => {
        if (prevEvent?.id) {
            router.push(`/admin/events/${prevEvent.id}`);
        }
    };

    const handleNextClick = () => {
        if (nextEvent?.id) {
            router.push(`/admin/events/${nextEvent.id}`);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    Loading event...
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Breadcrumbs and Nav Buttons */}
            <div className="flex justify-between items-center mb-6">
                <Breadcrumbs items={[
                    { label: "Admin", href: "/admin" },
                    { label: "Events", href: "/admin/events" },
                    { label: event ? formatEventDate(event) : "Event" }
                ]} />
                {!navLoading && (
                    <div className="flex gap-2">
                        <button
                            className="btn btn-secondary btn-small"
                            onClick={handlePrevClick}
                            disabled={!prevEvent?.id}
                        >
                            Prev
                        </button>
                        <button
                            className="btn btn-secondary btn-small"
                            onClick={handleNextClick}
                            disabled={!nextEvent?.id}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Event Header Card */}
            <div className={`event-card ${getPerformerCardClass(event)} mb-6`}>
                <h1 className="text-2xl font-semibold mb-2">
                    {event ? formatEventDate(event) : "Event"}
                </h1>
                {event?.venue && (
                    <p className="text-base text-gray-700">
                        {event.venue.name}
                        {event.venue.context && `, ${event.venue.context}`}
                        {event.venue.city && `, ${event.venue.city}`}
                        {event.venue.stateProvince && `, ${event.venue.stateProvince}`}
                    </p>
                )}
                {event?.primaryBand && (
                    <p className="text-sm text-gray-600 mt-1">
                        {event.primaryBand.name}
                    </p>
                )}
            </div>

            {eventIdNumeric && (
                <>
                    <EventMetadataForm
                        eventId={eventIdNumeric}
                        onSaveSuccess={loadEventData}
                    />

                    <hr className="my-8" />
                    <SetsSection eventId={eventIdNumeric} />
                    <hr className="my-8" />
                    <EventMusiciansSection eventId={eventIdNumeric} />
                    <hr className="my-8" />
                    <EventContributorsSection eventId={eventIdNumeric} />
                    <hr className="my-8" />
                    <RecordingsSection eventId={eventIdNumeric} />
                    <hr className="my-8" />
                    <ShowBanterSection eventId={eventIdNumeric} />
                </>
            )}

        </div>
    );
}