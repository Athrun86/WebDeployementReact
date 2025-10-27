import {useState} from "react";

function CopyButton ({text}: {text: string}) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erreur de copies:",  err);

        }
    };
    return (
        <button type="button" onClick={handleCopy} className="project-form-copy-btn-square">
            {copied ? (
            <span style={{fontSize: "1.2em"}}>✔</span>
                ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="5" y="3" width="10" height="14" rx="2" stroke="#fff" strokeWidth="2"/>
                    <rect x="2" y="6" width="10" height="11" rx="2" fill="#3395ff" stroke="#fff" strokeWidth="2"/>
                </svg>
                    )}
                </button>
            );
            }
            export default CopyButton;