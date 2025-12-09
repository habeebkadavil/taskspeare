import { ActivitiesClient } from "./activities-client";
import { activities, users, jobOrders, appointments } from "@/lib/data";

export default function ActivitiesPage() {
    return <ActivitiesClient 
        initialActivities={activities}
        users={users}
        jobOrders={jobOrders}
        appointments={appointments}
    />;
}
