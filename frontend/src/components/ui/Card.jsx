const Card = ({ children, className = "" }) => {
    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            {children}
        </div>
    );
};

export default Card; 