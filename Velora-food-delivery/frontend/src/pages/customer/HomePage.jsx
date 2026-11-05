import MainLayout from '../../layouts/MainLayout';
import HeroSection from '../../components/sections/HeroSection';
import PopularCategories from '../../components/sections/PopularCategories';
import FeaturedRestaurants from '../../components/sections/FeaturedRestaurants';
import TrendingFoods from '../../components/sections/TrendingFoods';

const HomePage = () => {
  return (
    <MainLayout>
      <HeroSection />
      <PopularCategories />
      <FeaturedRestaurants />
      <TrendingFoods />
    </MainLayout>
  );
};

export default HomePage;
