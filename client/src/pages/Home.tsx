
import { useState } from "react";
import Navbar from "../components/1.Navbar";
import Hero from "../components/2.Hero";
import WhyAangan from "../components/3.WhyAangan";
import MissionVision from "../components/4.Mission";
import Testimonials from "../components/6.Testimonials";
import FAQ from "../components/5.FAQ";
import Pricing from "../components/9.Pricing";
import { ContactUs } from "../components/10.ContactUs";
import WaitlistSection from "../components/7.WaitlistSection";
import FooterSection from "../components/8.FooterSection";



export default function Home() {
  // For Navbar section highlighting
  const [section, setSection] = useState<'home' | 'community' | 'pricing'>("home");

  return (
    <>
      <Navbar section={section} setSection={setSection} />
      <Hero />
  <div className="-mt-4 md:mt-24">
        <WhyAangan />
      </div>
      <div className="mt-24">
        <MissionVision />
      </div>
      <div id="testimonials">
        <Testimonials setSection={setSection} />
      </div>
      <FAQ />
  <div id="pricing" className="scroll-mt-24">
        <Pricing setSection={setSection} />
      </div>
      <ContactUs />
  {/* Blog section removed. Waitlist and Footer below. */}
      <div id="waitlist" style={{ paddingTop: '2rem' }}>
        <WaitlistSection />
      </div>
      <FooterSection />
    </>
  );
}

// Helpers
