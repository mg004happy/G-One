import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminRestaurants } from '../../store/slices/adminSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Store, XCircle, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { formatDateTime, formatRole } from '../../utils/formatters';
import { usePolling } from '../../hooks/usePolling';
import employeeService from '../../services/employeeService';
import { formatCurrency } from '../../utils/formatters';

const AdminRestaurants = () => {
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [employeeRestaurant, setEmployeeRestaurant] = useState(null);
  const [restaurantEmployees, setRestaurantEmployees] = useState([]);
  const [restaurantDepartures, setRestaurantDepartures] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminRestaurants({ page, size: 10 }));
  }, [dispatch, page]);
  usePolling(() => dispatch(fetchAdminRestaurants({ page, size: 10 })));

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await adminService.approveRestaurant(id);
      else await adminService.disableRestaurant(id);
      toast.success(`Restaurant ${action}d`);
      dispatch(fetchAdminRestaurants({ page, size: 10 }));
    } catch (err) {
      toast.error(err?.message || `Failed to ${action}`);
    }
  };

  const viewOwner = async (ownerId) => {
    setOwnerLoading(true);
    setOwnerDetails(null);
    try {
      setOwnerDetails(await adminService.getUserById(ownerId));
    } catch (err) {
      toast.error(err?.message || 'Failed to load restaurant owner');
    } finally {
      setOwnerLoading(false);
    }
  };

  const viewEmployees = async (restaurant) => {
    setEmployeesLoading(true);
    setEmployeeRestaurant(restaurant);
    setRestaurantEmployees([]);
    setRestaurantDepartures([]);
    try {
      const [employees, departures] = await Promise.all([
        employeeService.listForAdmin(restaurant.id),
        employeeService.listDeparturesForAdmin(restaurant.id),
      ]);
      setRestaurantEmployees(employees);
      setRestaurantDepartures(departures);
    } catch (err) {
      toast.error(err?.message || 'Failed to load employee roster');
    } finally {
      setEmployeesLoading(false);
    }
  };

  const list = restaurants?.content || (Array.isArray(restaurants) ? restaurants : []);
  const totalPages = restaurants?.totalPages || 0;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            <Store className="inline w-6 h-6 mr-2" /> Restaurant Management
          </h1>
        </div>

        {loading && list.length === 0 ? (
          <LoadingSpinner text="Loading restaurants..." />
        ) : (
          <div className="grid gap-4 stagger-children">
            {list.map((r) => (
              <div key={r.id || r.orderNumber} className="flex items-center gap-4 p-5 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-tertiary)] flex items-center justify-center text-2xl">
                  {r.imageUrl ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" /> : '🍽️'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{r.name || `Order #${r.orderNumber}`}</h3>
                  <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>{r.address || r.deliveryAddress || '—'}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Owner: {r.ownerName || 'Unknown'}{r.ownerEmail ? ` · ${r.ownerEmail}` : ''}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Company tie-ups: {r.tieUpCompanies?.length ? r.tieUpCompanies.join(', ') : 'None listed'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.ownerId && <Button size="sm" variant="secondary" onClick={() => viewOwner(r.ownerId)}><UserRound className="w-3.5 h-3.5" /> View Owner</Button>}
                  <Button size="sm" variant="secondary" onClick={() => viewEmployees(r)}>Employee roster</Button>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${!r.approved ? 'bg-amber-100 text-amber-700' : r.closedByAdmin ? 'bg-red-100 text-red-700' : r.active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {!r.approved ? 'Pending approval' : r.closedByAdmin ? 'Disabled by admin' : r.active ? 'Open' : 'Closed by owner'}
                  </span>
                  {!r.approved ? (
                    <Button size="sm" variant="success" onClick={() => handleAction(r.id, 'approve')} title="Approve restaurant">Approve</Button>
                  ) : r.active ? (
                    <Button size="sm" variant="danger" onClick={() => handleAction(r.id, 'disable')} title="Disable restaurant"><XCircle className="w-3.5 h-3.5" /> Disable</Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {(ownerLoading || ownerDetails) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Restaurant owner details">
            <div className="w-full max-w-lg rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Restaurant Owner Details</h2>
                <button onClick={() => { setOwnerDetails(null); setOwnerLoading(false); }} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]" aria-label="Close owner details"><X className="w-5 h-5" /></button>
              </div>
              {ownerLoading ? <LoadingSpinner text="Loading owner details..." /> : ownerDetails && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Name</dt><dd className="mt-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>{ownerDetails.fullName}</dd></div>
                  <div><dt className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Email</dt><dd className="mt-1 font-medium break-all" style={{ color: 'var(--color-text-primary)' }}>{ownerDetails.email}</dd></div>
                  <div><dt className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Role</dt><dd className="mt-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatRole(ownerDetails.role)}</dd></div>
                  <div><dt className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Account Status</dt><dd className="mt-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>{ownerDetails.accountStatus}</dd></div>
                  <div><dt className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Joined</dt><dd className="mt-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatDateTime(ownerDetails.createdAt)}</dd></div>
                  <div><dt className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Blocked</dt><dd className="mt-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>{ownerDetails.blocked ? 'Yes' : 'No'}</dd></div>
                </dl>
              )}
            </div>
          </div>
        )}

        {employeeRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Company employee roster">
            <div className="w-full max-w-5xl rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4"><div><h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Employee roster · {employeeRestaurant.name}</h2><p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>The company owed balance is summed from non-cancelled orders.</p></div><button onClick={() => setEmployeeRestaurant(null)} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]" aria-label="Close employee roster"><X className="w-5 h-5" /></button></div>
              {employeesLoading ? <LoadingSpinner text="Loading employee roster..." /> : <>
                <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr style={{ color: 'var(--color-text-tertiary)' }}><th className="p-2">Employee</th><th className="p-2">Employee ID</th><th className="p-2">Company</th><th className="p-2">Phone</th><th className="p-2">Orders</th><th className="p-2">Company owes</th></tr></thead><tbody>{restaurantEmployees.map((employee) => <tr key={employee.id} style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><td className="p-2">{employee.employeeName}</td><td className="p-2">{employee.employeeId}</td><td className="p-2">{employee.companyName}</td><td className="p-2">{employee.phoneNumber}</td><td className="p-2">{employee.orderCount}</td><td className="p-2 font-semibold">{formatCurrency(employee.companyOwedAmount)}</td></tr>)}</tbody></table>{restaurantEmployees.length === 0 && <p className="py-8 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No employee records for this restaurant.</p>}</div>
                <h3 className="text-lg font-bold mt-8 mb-3" style={{ color: 'var(--color-text-primary)' }}>Customers who left the tie-up facility</h3>
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr style={{ color: 'var(--color-text-tertiary)' }}><th className="p-2">Customer</th><th className="p-2">Email</th><th className="p-2">Employee ID</th><th className="p-2">Phone</th><th className="p-2">Company</th><th className="p-2">Left on</th></tr></thead><tbody>{restaurantDepartures.map((departure, index) => <tr key={`${departure.customerEmail}-${departure.leftAt}-${index}`} style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}><td className="p-2">{departure.customerName}</td><td className="p-2">{departure.customerEmail}</td><td className="p-2">{departure.employeeId || '—'}</td><td className="p-2">{departure.phoneNumber || '—'}</td><td className="p-2">{departure.companyName}</td><td className="p-2">{formatDateTime(departure.leftAt)}</td></tr>)}</tbody></table>{restaurantDepartures.length === 0 && <p className="py-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No customers have left this restaurant’s tied-up companies.</p>}</div>
              </>}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Page {page + 1} of {totalPages}</span>
            <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminRestaurants;
