import Link from "next/link";
import { getMusiciansBrowse } from "@/lib/queries/musicianBrowseQueries";

export const dynamic = "force-dynamic";

export default async function MusicianBrowsePage() {
    const musicians = await getMusiciansBrowse();

    return (
        <div className="page-container">
            <h1 className="page-title">Musicians</h1>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Instrument</th>
                            <th>Appearances</th>
                        </tr>
                    </thead>
                    <tbody>
                        {musicians.map((m) => (
                            <tr key={m.id}>
                                <td>
                                    <Link href={`/musician/${m.slug}`} className="link">
                                        {m.displayName}
                                    </Link>
                                </td>
                                <td>{m.defaultInstrument || ""}</td>
                                <td>{m.appearanceCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
