import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import restaurantService from '../../services/restaurantService';
import { useAuth } from '../../hooks/useAuth';

const OwnerRestaurantTieUps = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    restaurantService.getAll()
      .then((restaurants) => {
        const owned = restaurants.find((item) => item.ownerEmail === user?.email && String(item.id) === id);
        if (!owned) {
          toast.error('Restaurant not found in your account');
          navigate('/owner');
          return;
        }
        if (active) {
          setRestaurant(owned);
          setCompanies(owned.tieUpCompanies || []);
        }
      })
      .catch((error) => toast.error(error.message || 'Could not load restaurant'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, navigate, user?.email]);

  const addCompany = () => {
    const company = draft.trim();
    if (!company || companies.some((item) => item.toLowerCase() === company.toLowerCase())) return;
    setCompanies((current) => [...current, company]);
    setDraft('');
  };

  const saveCompanies = async () => {
    if (!restaurant?.id) return;
    setSaving(true);
    try {
      const updated = await restaurantService.updateTieUps(restaurant.id, companies);
      setRestaurant(updated);
      setCompanies(updated.tieUpCompanies || []);
      toast.success('Company tie-ups saved');
    } catch (error) {
      toast.error(error.message || 'Could not save company tie-ups');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <LoadingSpinner text="Loading company tie-ups..." /> : restaurant && <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link to="/owner" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]" aria-label="Back to owner dashboard">
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
              <div>
                <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}><Building2 className="inline w-6 h-6 mr-2" />Company tie-ups</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{restaurant.name}</p>
              </div>
            </div>
            <Link to={`/owner/restaurant/${restaurant.id}/employees`}><Button variant="secondary">Employee verification roster</Button></Link>
          </div>

          <section className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Partner companies</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>Add every company that has an employee benefit agreement with this restaurant. Once the restaurant is approved, these companies become available to customers at registration and in their profile.</p>
            <div className="flex gap-2">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCompany(); } }} maxLength={120} className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" placeholder="Company name" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              <Button type="button" variant="secondary" onClick={addCompany}>Add company</Button>
            </div>
            <ul className="mt-4 space-y-2">
              {companies.map((company) => <li key={company} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                <span>{company}</span>
                <button type="button" onClick={() => setCompanies((current) => current.filter((item) => item !== company))} className="inline-flex items-center gap-1 text-red-500 hover:text-red-600" aria-label={`Remove ${company}`}><X className="w-4 h-4" /> Remove</button>
              </li>)}
              {companies.length === 0 && <li className="rounded-xl px-4 py-6 text-sm text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' }}>No company tie-ups added yet.</li>}
            </ul>
            <div className="flex justify-end mt-5"><Button onClick={saveCompanies} loading={saving}>Save company tie-ups</Button></div>
          </section>
        </>}
      </div>
    </MainLayout>
  );
};

export default OwnerRestaurantTieUps;
