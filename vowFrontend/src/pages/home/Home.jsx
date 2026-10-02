import Hero from "../../components/home/hero";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import CTA from "../../components/home/CTA";
import HomeFooter from "../../components/home/HomeFooter";
import HomeNavbar from "../../components/home/HomeNavbar";

const Home = () => {
  return (
    <div>
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