import HomeNavbar from "../../components/home/HomeNavbar";
import Hero from "../../components/home/Hero";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import CTA from "../../components/home/CTA";
import HomeFooter from "../../components/home/HomeFooter";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <HomeNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <HomeFooter />
    </div>
  );
};

export default Home;