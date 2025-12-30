import { useMemo } from "react";
import { useCultivationPlan } from "../../contexts/CultivationPlanContext";


export const usePlanStatistics = () => {
    const { plans } = useCultivationPlan();

    const statistics = useMemo(() => {
        const totalPlans = plans.length;
        const plannedPlans = plans.filter(plan => plan.status === 'planned').length;
        const plantedPlans = plans.filter(plan => plan.status === 'planted').length;
        const harvestedPlans = plans.filter(plan => plan.status === 'harvested').length;
        const cancelledPlans = plans.filter(plan => plan.status === 'cancelled').length;
        const totalArea = plans
            .filter(plan => plan.status === 'planted' || plan.status === 'planned')
            .reduce((sum, plan) => sum + (plan.area || 0), 0);
        

        return {
            total: totalPlans,
            planted: plantedPlans,
            planned: plannedPlans,
            completed: harvestedPlans,
            cancelled: cancelledPlans,
            plantedPercentage: totalPlans > 0 ? Math.round(((totalPlans - cancelledPlans) / totalPlans) * 100) : 0,
            completionRate: totalPlans > 0 ? Math.round((harvestedPlans/ (totalPlans-cancelledPlans)) * 100) : 0,
            totalArea: totalArea.toFixed(2)
        };
    }, [plans]);
    return statistics;
};