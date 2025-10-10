import { useEffect, useState } from "react";
import { getLocationName } from "../common/geocoding";

export const useLocation = (lat, lng) => {
    const [locationAddress, setLocationAddress] = useState('');
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    useEffect(() => {
        const fetchLocationName = async () => {
            // Reset if no coordinates
            if (!lat || !lng) {
                setLocationAddress('');
                return;
            }

            setIsLoadingAddress(true);
            try {
                const address = await getLocationName(lat, lng);
                setLocationAddress(address);
            } catch (error) {
                setLocationAddress('Location unavailable');
            } finally {
                setIsLoadingAddress(false);
            }
        };

        fetchLocationName();
    }, [lat, lng]);

    // Return as object (correct way)
    return { locationAddress, isLoadingAddress };
}