import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, updateUserStatus } from '../../store/slices/adminSlice';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime, formatRole } from '../../utils/formatters';
import { Users, ArrowLeft, ShieldCheck, ShieldOff, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';
import { useDebounce } from '../../hooks/useDebounce';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const search = useDebounce(searchInput.trim(), 300);

  useEffect(() => {
    dispatch(fetchAdminUsers({ page, size: 10, ...(search ? { search } : {}), ...(role ? { role } : {}) }));
  }, [dispatch, page, search, role]);
  usePolling(() => dispatch(fetchAdminUsers({ page, size: 10, ...(search ? { search } : {}), ...(role ? { role } : {}) })));

  const updateSearch = (value) => { setSearchInput(value); setPage(0); };
  const updateRole = (value) => { setRole(value); setPage(0); };

  const handleStatusChange = (id, accountStatus) => {
    dispatch(updateUserStatus({ id, data: { accountStatus } }))
      .unwrap()
      .then(() => toast.success(`User ${accountStatus.toLowerCase()}`))
      .catch((err) => toast.error(err));
  };

  const userList = users?.content || [];
  const totalPages = users?.totalPages || 0;
  const showCompanyColumns = role !== 'RESTAURANT_OWNER';

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/admin"
            className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              <Users className="inline w-6 h-6 mr-2" /> User Management
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {users?.totalElements || 0} matching users
            </p>
          </div>
        </div>

        {loading && userList.length === 0 ? (
          <LoadingSpinner text="Loading users..." />
        ) : (
          <>
            <div className="mb-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  value={searchInput}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search by name or email"
                  aria-label="Search users by name or email"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                {searchInput && <button type="button" onClick={() => updateSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4" /></button>}
              </div>
              <select
                value={role}
                onChange={(event) => updateRole(event.target.value)}
                aria-label="Filter users by role"
                className="px-4 py-3 rounded-xl text-sm outline-none sm:w-56"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <option value="">All user types</option>
                <option value="CUSTOMER">Customers</option>
                <option value="RESTAURANT_OWNER">Restaurant owners</option>
              </select>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Name', 'Email', 'Role', ...(showCompanyColumns ? ['Company', 'Employee ID'] : []), 'Status', 'Joined', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-left text-xs font-bold uppercase"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-[var(--color-bg-secondary)]"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                      >
                        <td className="px-5 py-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {user.fullName}
                        </td>
                        <td className="px-5 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                          {user.email}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary-dark)',
                            }}
                          >
                            {formatRole(user.role)}
                          </span>
                        </td>
                        {showCompanyColumns && <>
                          <td className="px-5 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                            {user.role === 'CUSTOMER' && user.companyAffiliated ? user.affiliatedCompany : '—'}
                          </td>
                          <td className="px-5 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                            {user.role === 'CUSTOMER' && user.companyAffiliated ? user.employeeId : '—'}
                          </td>
                        </>}
                        <td className="px-5 py-4">
                          <StatusBadge status={user.accountStatus} />
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {formatDateTime(user.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            {user.accountStatus !== 'ACTIVE' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                title="Activate"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {user.accountStatus !== 'BLOCKED' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusChange(user.id, 'BLOCKED')}
                                title="Block"
                              >
                                <ShieldOff className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span
                  className="px-4 py-2 text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminUsers;
