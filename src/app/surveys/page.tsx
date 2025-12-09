
import { SurveysClient } from "./surveys-client";
import { surveys, customers, jobOrders, items } from "@/lib/data";

export default function SurveysPage() {
    const serviceItems = items.filter(i => i.itemTypeId === 'type-3');
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <SurveysClient 
                initialSurveys={surveys}
                customers={customers}
                jobOrders={jobOrders}
                services={serviceItems}
            />
        </div>
    )
}
