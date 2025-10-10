// src/hooks/usePlanLocations.js
import { useEffect, useState } from "react";
import { getLocationName } from "../common/geocoding";

export const usePlanLocations = (plans) => {
  const [planLocations, setPlanLocations] = useState({});

  useEffect(() => {
    const fetchLocationNames = async () => {
      const locationPromises = plans.map(async (plan) => {
        if (plan.farmLat && plan.farmLng) {
          try {
            const locationName = await getLocationName(plan.farmLat, plan.farmLng);
            return { planId: plan.id, locationName };
          } catch (error) {
            return { planId: plan.id, locationName: "Location unavailable" };
          }
        }
        return { planId: plan.id, locationName: "No location set" };
      });

      const results = await Promise.all(locationPromises);
      const locationMap = {};
      results.forEach((result) => {
        locationMap[result.planId] = result.locationName;
      });
      setPlanLocations(locationMap);
    };

    if (plans.length > 0) {
      fetchLocationNames();
    }
  }, [plans]);

  return planLocations;
};
