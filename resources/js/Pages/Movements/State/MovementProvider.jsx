const MovementProvider = ({ children }) => {
    return (
        <MovementContext.Provider value={{}}>
            {children}
        </MovementContext.Provider>
    );
};

export default MovementProvider;