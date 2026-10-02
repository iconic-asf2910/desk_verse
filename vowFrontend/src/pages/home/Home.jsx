import Hero from "../../components/home/hero";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import CTA from "../../components/home/CTA";
import HomeFooter from "../../components/home/HomeFooter";

const Home = () => {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <HomeFooter />
    </div>
  );
};

export default Home;