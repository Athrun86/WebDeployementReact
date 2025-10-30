import React from "react";

interface Organisation {
    id: number;
    login: string;
}

interface Props {
    organisations: Organisation[];
    value: number | undefined;
    onChange: (id: number) => void;
}

const OrganisationSelect: React.FC<Props> = ({ organisations, value, onChange }) => (
    <select
        id="OrganisationSelect"
        value={value ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        required
    >
        <option value="" disabled>Choisissez une organisation</option>
        {organisations.map(org => (
            <option key={org.id} value={org.id}>
                {org.login}
            </option>
        ))}
    </select>
);

export default OrganisationSelect;
