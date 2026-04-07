const Badge = ({ label, colorClass, dotClass }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
        >
            {dotClass && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            )}
            {label}
        </span>
    )
}

export default Badge