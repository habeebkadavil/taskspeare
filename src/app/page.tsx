import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, DollarSign, ListTodo } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { TechnicianPerformance } from "@/components/technician-performance"
import { jobOrders, customers, sales } from "@/lib/data"
import { companyDetails } from "@/lib/company"

export default function Home() {
  const pendingJobs = jobOrders.filter(j => j.status === 'Pending').length;
  const totalCustomers = customers.length;
  const revenueToday = sales
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="relative h-full">
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>
      <div className="relative z-10 flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Today
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyDetails.currencySymbol}{revenueToday.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total sales recorded today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Total clients in the system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{pendingJobs}</div>
              <p className="text-xs text-muted-foreground">
                Jobs waiting to be started
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Sales
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyDetails.currencySymbol}12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
            <TechnicianPerformance />
            <Card>
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <p className="text-sm text-muted-foreground">
                    You made {sales.length} sales this month.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                    {sales.slice(0, 5).map(sale => {
                        const customer = customers.find(c => c.id === sale.customerId);
                        return (
                        <div key={sale.id} className="flex items-center">
                            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Users className="h-5 w-5" />
                            </div>
                            <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{customer?.name}</p>
                            <p className="text-sm text-muted-foreground">{customer?.email}</p>
                            </div>
                            <div className="ml-auto font-medium">+{companyDetails.currencySymbol}{sale.total.toFixed(2)}</div>
                        </div>
                        )
                    })}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
