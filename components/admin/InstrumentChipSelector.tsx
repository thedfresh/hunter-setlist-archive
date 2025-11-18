import React, { useEffect, useState } from "react";

interface Instrument {
    id: number;
    displayName: string;
}

interface InstrumentChipSelectorProps {
    selectedInstruments: Instrument[];
    onChange: (instruments: Instrument[]) => void;
    disabled?: boolean;
}

const InstrumentChipSelector: React.FC<InstrumentChipSelectorProps> = ({ selectedInstruments, onChange, disabled }) => {
    const [availableInstruments, setAvailableInstruments] = useState<Instrument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/instruments")
            .then(res => res.json())
            .then(data => {
                setAvailableInstruments(data.instruments || []);
            })
            .catch(() => setAvailableInstruments([]))
            .finally(() => setLoading(false));
    }, []);

    // Filter out already-selected instruments from available
    const filteredAvailable = availableInstruments.filter(
        inst => !selectedInstruments.some(sel => sel.id === inst.id)
    );

    function handleAddInstrument(inst: Instrument) {
        if (disabled) return;
        onChange([...selectedInstruments, inst]);
    }

    function handleRemoveInstrument(id: number) {
        if (disabled) return;
        onChange(selectedInstruments.filter(inst => inst.id !== id));
    }

    return (
        <div className="space-y-3">
            {/* Selected Instruments */}
            <div className="flex flex-wrap gap-2">
                {selectedInstruments.length > 0 ? (
                    selectedInstruments.map(inst => (
                        <span
                            key={inst.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                            {inst.displayName}
                            <button
                                type="button"
                                className="hover:text-red-600 transition-colors"
                                onClick={() => handleRemoveInstrument(inst.id)}
                                disabled={disabled}
                                aria-label={`Remove ${inst.displayName}`}
                            >
                                ×
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400 italic">No instruments selected</span>
                )}
            </div>

            {/* Available Instruments */}
            <div className="flex flex-wrap gap-2">
                {loading ? (
                    <span className="text-gray-400 italic">Loading instruments...</span>
                ) : filteredAvailable.length > 0 ? (
                    filteredAvailable.map(inst => (
                        <button
                            key={inst.id}
                            type="button"
                            className="btn btn-secondary btn-small inline-flex"
                            onClick={() => handleAddInstrument(inst)}
                            disabled={disabled}
                        >
                            {inst.displayName}
                        </button>
                    ))
                ) : (
                    <span className="text-gray-400 italic">No more instruments</span>
                )}
            </div>
        </div>
    );
};

export default InstrumentChipSelector;
