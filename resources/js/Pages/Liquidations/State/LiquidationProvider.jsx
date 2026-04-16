import LiquidationContext from "./LiquidationContext"

const LiquidationProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);
    const handleProductModal = (state) => {
        if (state) {
            setSearch('')
        }
        setShowProductModal(state)
    }
    return (
        <LiquidationContext.Provider value={
            {
                search, setSearch,
                handleProductModal
            }
        }>
            {children}
        </LiquidationContext.Provider>
    )
}

export default LiquidationProvider