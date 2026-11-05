import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UsersRound, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import employeeService from '../../services/employeeService';
import restaurantService from '../../services/restaurantService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const OwnerRestaurantEmployees = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tieUpCustomers, setTieUpCustomers] = useState([]);
  const [tieUpDepartures, setTieUpDepartures] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [departureSearch, setDepartureSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [form, setForm] = useState({ employeeName: '', employeeId: '', companyName: '', phoneNumber: '' });

  const loadEmployees = async (restaurantId) => {
    const rows = await employeeService.listForRestaurant(restaurantId);
    setEmployees(rows);
  };

  useEffect(() => {
    let active = true;
    restaurantService.getAll()
      .then(async (restaurants) => {
        const owned = restaurants.find((item) => item.ownerEmail === user?.email && String(item.id) === id);
        if (!owned) {
          toast.error('Restaurant not found in your account');
          navigate('/owner');
          return;
        }
        if (active) setRestaurant(owned);
        const rows = await employeeService.listForRestaurant(owned.id);
        if (active) setEmployees(rows);
        const customers = await employeeService.listTieUpCustomers(owned.id);
        if (active) setTieUpCustomers(customers);
        const departures = await employeeService.listTieUpDepartures(owned.id);
        if (active) setTieUpDepartures(departures);
      })
      .catch((error) => toast.error(error.message || 'Could not load employee roster'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, navigate, user?.email]);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const addEmployee = async (event) => {
    event.preventDefault();
    if (!restaurant?.id) return;
    setSaving(true);
    try {
      await employeeService.add(restaurant.id, form);
      setForm({ employeeName: '', employeeId: '', companyName: '', phoneNumber: '' });
      await loadEmployees(restaurant.id);
      toast.success('Employee added to the verification roster');
    } catch (error) {
      toast.error(error.message || 'Could not add employee');
    } finally {
      setSaving(false);
    }
  };

  const removeEmployee = async (employee) => {
    if (!restaurant?.id || !window.confirm(`Remove ${employee.employeeName} from this restaurant's verification roster?`)) return;
    setRemovingId(employee.id);
    try {
      await employeeService.remove(restaurant.id, employee.id);
      setEmployees((current) => current.filter((row) => row.id !== employee.id));
      toast.success('Employee removed from the roster');
    } catch (error) {
      toast.error(error.message || 'Could not remove employee');
    } finally {
      setRemovingId(null);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  };
  const normalizedCustomerSearch = customerSearch.trim().toLowerCase();
  const filteredTieUpCustomers = tieUpCustomers.filter((customer) =>
    [customer.fullName, customer.email, customer.employeeId]
      .some((value) => value?.toLowerCase().includes(normalizedCustomerSearch))
  );
  const normalizedDepartureSearch = departureSearch.trim().toLowerCase();
  const filteredTieUpDepartures = tieUpDepartures.filter((departure) =>
    [departure.customerName, departure.customerEmail, departure.employeeId]
      .some((value) => value?.toLowerCase().includes(normalizedDepartureSearch))
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <LoadingSpinner text="Loading employee roster..." /> : restaurant && <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link to="/owner" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]" aria-label="Back to owner dashboard">
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
              <div>
                <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}><UsersRound className="inline w-6 h-6 mr-2" />Employee verification roster</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{restaurant.name}</p>
              </div>
            </div>
            <Link to={`/owner/restaurant/${restaurant.id}/tie-ups`}><Button variant="secondary">Manage company tie-ups</Button></Link>
          </div>

          <section className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Add an employee</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>Customers can verify their affiliation only when their account name, company, and employee ID match a roster entry. Order count and company balance are calculated from orders.</p>
            {restaurant.tieUpCompanies?.length ? <form onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-3">
              <input name="employeeName" required maxLength={160} value={form.employeeName} onChange={handleChange} className="px-3 py-2.5 rounded-lg text-sm outline-none" placeholder="Employee full name" style={inputStyle} />
              <input name="employeeId" required maxLength={80} value={form.employeeId} onChange={handleChange} className="px-3 py-2.5 rounded-lg text-sm outline-none" placeholder="Employee ID" style={inputStyle} />
              <select name="companyName" required value={form.companyName} onChange={handleChange} className="px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="">Select tied-up company</option>
                {restaurant.tieUpCompanies.map((company) => <option key={company} value={company}>{company}</option>)}
              </select>
              <input name="phoneNumber" required maxLength={40} value={form.phoneNumber} onChange={handleChange} className="px-3 py-2.5 rounded-lg text-sm outline-none" placeholder="Employee phone number" style={inputStyle} />
              <div className="sm:col-span-2 flex justify-end"><Button type="submit" loading={saving}>Add employee</Button></div>
            </form> : <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
              Add and save at least one company tie-up in restaurant details before adding employees.
            </div>}
          </section>

          <section className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Registered employees</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[820px]">
                <thead><tr style={{ color: 'var(--color-text-tertiary)' }}><th className="p-2">Employee</th><th className="p-2">Employee ID</th><th className="p-2">Company</th><th className="p-2">Phone</th><th className="p-2">Orders</th><th className="p-2">Company owes</th><th className="p-2">Action</th></tr></thead>
                <tbody>{employees.map((employee) => <tr key={employee.id} style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <td className="p-2">{employee.employeeName}</td><td className="p-2">{employee.employeeId}</td><td className="p-2">{employee.companyName}</td><td className="p-2">{employee.phoneNumber}</td><td className="p-2">{employee.orderCount}</td><td className="p-2 font-semibold">{formatCurrency(employee.companyOwedAmount)}</td><td className="p-2"><Button size="sm" variant="danger" loading={removingId === employee.id} disabled={removingId !== null} onClick={() => removeEmployee(employee)} title="Remove from roster"><Trash2 className="w-4 h-4" /><span className="sr-only">Remove {employee.employeeName}</span></Button></td>
                </tr>)}</tbody>
              </table>
              {employees.length === 0 && <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>No employees have been added for this restaurant.</p>}
            </div>
          </section>

          <section className="rounded-2xl p-6 mt-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Customers using company tie-ups</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Customers who have verified their affiliation with a company tied to this restaurant.</p>
            <label className="relative block mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input type="search" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Search by name, email, or employee ID" className="w-full sm:max-w-md pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} aria-label="Search tie-up customers by name, email, or employee ID" />
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[760px]">
                <thead><tr style={{ color: 'var(--color-text-tertiary)' }}><th className="p-2">Customer</th><th className="p-2">Email</th><th className="p-2">Employee ID</th><th className="p-2">Phone</th><th className="p-2">Company</th></tr></thead>
                <tbody>{filteredTieUpCustomers.map((customer) => <tr key={`${customer.email}-${customer.affiliatedCompany}`} style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <td className="p-2 font-medium">{customer.fullName}</td><td className="p-2">{customer.email}</td><td className="p-2">{customer.employeeId}</td><td className="p-2">{customer.phoneNumber || '—'}</td><td className="p-2">{customer.affiliatedCompany}</td>
                </tr>)}</tbody>
              </table>
              {filteredTieUpCustomers.length === 0 && <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>{tieUpCustomers.length === 0 ? 'No customers have verified an affiliation with this restaurant’s tied-up companies yet.' : 'No customers match your search.'}</p>}
            </div>
          </section>

          <section className="rounded-2xl p-6 mt-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Customers who left the tie-up facility</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Customers who removed their company affiliation, with the date they left.</p>
            <label className="relative block mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input type="search" value={departureSearch} onChange={(event) => setDepartureSearch(event.target.value)} placeholder="Search by name, email, or employee ID" className="w-full sm:max-w-md pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} aria-label="Search departed customers by name, email, or employee ID" />
            </label>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[900px]">
                <thead><tr style={{ color: 'var(--color-text-tertiary)' }}><th className="p-2">Customer</th><th className="p-2">Email</th><th className="p-2">Employee ID</th><th className="p-2">Phone</th><th className="p-2">Company</th><th className="p-2">Left on</th></tr></thead>
                <tbody>{filteredTieUpDepartures.map((departure, index) => <tr key={`${departure.customerEmail}-${departure.leftAt}-${index}`} style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <td className="p-2 font-medium">{departure.customerName}</td><td className="p-2">{departure.customerEmail}</td><td className="p-2">{departure.employeeId || '—'}</td><td className="p-2">{departure.phoneNumber || '—'}</td><td className="p-2">{departure.companyName}</td><td className="p-2">{formatDateTime(departure.leftAt)}</td>
                </tr>)}</tbody>
              </table>
              {filteredTieUpDepartures.length === 0 && <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>{tieUpDepartures.length === 0 ? 'No customers have left the tie-up facility.' : 'No departed customers match your search.'}</p>}
            </div>
          </section>
        </>}
      </div>
    </MainLayout>
  );
};

export default OwnerRestaurantEmployees;
