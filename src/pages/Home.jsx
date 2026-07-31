import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
 import About from "../components/About";
// import Footer from "../components/Footer";
 import HowItWorks from "../components/HowitWorks";

function Home() {
  return (
    <>
      
      <Hero />
      <Features />
      <About />   
      <HowItWorks />
      {/* <Footer />*/}
    </>
  );
}

export default Home;