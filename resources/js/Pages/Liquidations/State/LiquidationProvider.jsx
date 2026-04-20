import { useState, useCallback } from "react";
import LiquidationContext from "./LiquidationContext";

const LiquidationProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const handleProductModal = useCallback((state) => {
        setShowProductModal(state);
        if (!state) {
            setSearch('');
            setSelectedRowId(null);
        }
    }, []);

    const openProductModal = useCallback((rowId) => {
        setSelectedRowId(rowId);
        setShowProductModal(true);
    }, []);

    const closeProductModal = useCallback(() => {
        handleProductModal(false);
    }, [handleProductModal]);

    return (
        <LiquidationContext.Provider value={{
            search,
            setSearch,
            showProductModal,
            selectedRowId,
            setSelectedRowId,
            handleProductModal,
            openProductModal,
            closeProductModal
        }}>
            {children}
        </LiquidationContext.Provider>
    );
};

export default LiquidationProvider;