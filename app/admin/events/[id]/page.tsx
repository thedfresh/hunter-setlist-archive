"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { getPerformerCardClass } from "@/lib/utils/performerStyles";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import EventMetadataForm from "@/components/admin/EventMetadataForm";
import EventMusiciansSection from "@/components/admin/EventMusiciansSection";
import EventContributorsSection from "@/components/admin/EventContributorsSection";
import RecordingsSection from "@/components/admin/RecordingsSection";

export default function EventDetailPage() {
    const params = useParams();
    const eventSlug = params.id as string;

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<any>(null);
    const [eventIdNumeric, setEventIdNumeric] = useState<number | null>(null);

    useEffect(() => {
        loadEventData();
    }, [eventSlug]);

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
            <Breadcrumbs items={[
                { label: "Admin", href: "/admin" },
                { label: "Events", href: "/admin/events" },
                { label: event ? formatEventDate(event) : "Event" }
            ]} />

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
                    <EventMusiciansSection eventId={eventIdNumeric} />
                    <hr className="my-8" />
                    <EventContributorsSection eventId={eventIdNumeric} />
                    <hr className="my-8" />
                    <RecordingsSection eventId={eventIdNumeric} />
                </>
            )}

        </div>
    );
}