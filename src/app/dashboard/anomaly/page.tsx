"use client"

import AnomalyCenter from "@/components/layout/anomaly/table-anomaly"
import AnomalyScatterChart from "@/components/layout/anomaly/scatter-plot"


export default function AnomalyPage() {


    return (
        <div>
            <AnomalyScatterChart/>
            <AnomalyCenter />
        </div>
    )
}
