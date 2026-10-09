const HomeFooter = () => {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="px-14 py-9">
        <div className="grid grid-cols-6 gap-8">
          <div>
            <h2 className="text-2xl font-normal">
        DeskVerse
            </h2>

            <p className="mt-2 max-w-44 text-xs leading-5">
              Virtual Organized World - Bridging
              <br />
              Remote Teams
            </p>
          </div>

          <div>
            <h3 className="text-xs">Product</h3>

            <div className="mt-2 space-y-0.5 text-xs">
              <p>Overview</p>
              <p>Features</p>
              <p>Virtual Offices</p>
              <p>Integrations</p>
              <p>Pricing</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs">Company</h3>

            <div className="mt-2 space-y-0.5 text-xs">
              <p>About Us</p>
              <p>Careers</p>
              <p>Blog</p>
              <p>Press Kit</p>
              <p>Contact Us</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs">Support</h3>

            <div className="mt-2 space-y-0.5 text-xs">
              <p>Help Center</p>
              <p>Community</p>
              <p>Documentation</p>
              <p>Status</p>
              <p>Security</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs">Legal</h3>

            <div className="mt-2 space-y-0.5 text-xs">
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
              <p>Cookie Policy</p>
              <p>Security Compliance</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs">Stay Updated</h3>

           

            <div className="mt-3 flex gap-3 text-xs">
              <span>in</span>
              <span>𝕏</span>
              <span>◎</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-400 px-14 py-3">
        <p className="text-xs">
          © 2026 Technologies. All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default HomeFooter;