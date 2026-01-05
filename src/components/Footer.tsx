import { useState } from "react";
import { Facebook, Twitter, Linkedin, Instagram, BookOpen, HelpCircle, Shield, FileText } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ResourceType = "documentation" | "support" | "privacy" | "terms" | null;

const Footer = () => {
  const [openDialog, setOpenDialog] = useState<ResourceType>(null);

  const handleResourceClick = (e: React.MouseEvent<HTMLAnchorElement>, type: ResourceType) => {
    e.preventDefault();
    setOpenDialog(type);
  };

  const getDialogContent = () => {
    switch (openDialog) {
      case "documentation":
        return {
          title: "Documentation",
          icon: <BookOpen className="h-6 w-6 text-[#8ccc15]" />,
          content: (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
                <p className="text-muted-foreground mb-3">
                  Welcome to Smart Cooperative Hub! This platform helps cooperatives manage their operations, 
                  members, finances, and marketplace activities efficiently.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">User Roles</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Super Admin:</strong> Manages all cooperatives, users, and system-wide settings</li>
                  <li><strong>Cooperative Admin:</strong> Manages their cooperative, members, products, and announcements</li>
                  <li><strong>Member:</strong> Views contributions, requests loans, and accesses cooperative resources</li>
                  <li><strong>Buyer:</strong> Browses and purchases products from cooperatives</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Features</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Member management and registration</li>
                  <li>Financial tracking (contributions, savings, loans)</li>
                  <li>Product marketplace for cooperatives</li>
                  <li>Announcement and document management</li>
                  <li>Request system for loans and withdrawals</li>
                  <li>Blockchain integration for transaction verification</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">API Documentation</h3>
                <p className="text-muted-foreground">
                  For detailed API documentation, please contact our support team or refer to the developer 
                  documentation available in your dashboard.
                </p>
              </div>
            </div>
          ),
        };
      case "support":
        return {
          title: "Support",
          icon: <HelpCircle className="h-6 w-6 text-[#8ccc15]" />,
          content: (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">How We Support You</h3>
                <p className="text-muted-foreground mb-3">
                  Smart Cooperative Hub provides comprehensive support to ensure you have the best experience 
                  using our platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Support Channels</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <strong>Email Support:</strong> support@smartcooperativehub.rw
                    <br />
                    <span className="text-sm">Response time: Within 24 hours</span>
                  </li>
                  <li>
                    <strong>Phone Support:</strong> +250 788 123 456
                    <br />
                    <span className="text-sm">Available: Monday - Friday, 8 AM - 5 PM</span>
                  </li>
                  <li>
                    <strong>In-App Support:</strong> Use the help section in your dashboard
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Common Issues & Solutions</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Login Issues:</strong> Reset your password using the "Forgot Password" link</li>
                  <li><strong>Account Verification:</strong> Check your email for OTP code after registration</li>
                  <li><strong>Payment Problems:</strong> Contact your cooperative admin or our support team</li>
                  <li><strong>Technical Errors:</strong> Clear your browser cache or try a different browser</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Training & Resources</h3>
                <p className="text-muted-foreground">
                  We offer training sessions for cooperative administrators. Contact us to schedule a training 
                  session for your cooperative.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Feedback</h3>
                <p className="text-muted-foreground">
                  Your feedback helps us improve! Share your suggestions and report issues through the 
                  contact form or email us directly.
                </p>
              </div>
            </div>
          ),
        };
      case "privacy":
        return {
          title: "Privacy Policy",
          icon: <Shield className="h-6 w-6 text-[#8ccc15]" />,
          content: (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">Last Updated: {new Date().toLocaleDateString()}</h3>
                <p className="text-muted-foreground mb-3">
                  Smart Cooperative Hub is committed to protecting your privacy. This policy explains how we 
                  collect, use, and safeguard your personal information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Information We Collect</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Personal identification information (name, email, phone number)</li>
                  <li>Cooperative registration details</li>
                  <li>Financial transaction data</li>
                  <li>Usage data and analytics</li>
                  <li>Device and browser information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>To provide and maintain our services</li>
                  <li>To process transactions and manage accounts</li>
                  <li>To send important notifications and updates</li>
                  <li>To improve our platform and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Data Security</h3>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures including encryption, secure servers, and 
                  regular security audits to protect your data from unauthorized access, alteration, or disclosure.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Data Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Your cooperative administrators (for member-related data)</li>
                  <li>Service providers who assist in platform operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Your Rights</h3>
                <p className="text-muted-foreground">
                  You have the right to access, update, or delete your personal information. Contact us 
                  at privacy@smartcooperativehub.rw to exercise these rights.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
                <p className="text-muted-foreground">
                  For privacy-related questions, contact us at privacy@smartcooperativehub.rw
                </p>
              </div>
            </div>
          ),
        };
      case "terms":
        return {
          title: "Terms of Service",
          icon: <FileText className="h-6 w-6 text-[#8ccc15]" />,
          content: (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">Last Updated: {new Date().toLocaleDateString()}</h3>
                <p className="text-muted-foreground mb-3">
                  By accessing and using Smart Cooperative Hub, you agree to be bound by these Terms of Service. 
                  Please read them carefully.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By registering for an account or using our services, you acknowledge that you have read, 
                  understood, and agree to be bound by these terms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">User Accounts</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for all activities under your account</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Acceptable Use</h3>
                <p className="text-muted-foreground mb-2">You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit viruses or malicious code</li>
                  <li>Interfere with platform operations or security</li>
                  <li>Harass, abuse, or harm other users</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Transactions</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>All transactions are final unless otherwise stated</li>
                  <li>Prices and availability are subject to change</li>
                  <li>You are responsible for payment processing fees</li>
                  <li>Refunds are subject to cooperative policies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Intellectual Property</h3>
                <p className="text-muted-foreground">
                  All content, features, and functionality of the platform are owned by Smart Cooperative Hub 
                  and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  Smart Cooperative Hub shall not be liable for any indirect, incidental, special, or 
                  consequential damages arising from your use of the platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Termination</h3>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your account at any time for violation of 
                  these terms or for any other reason we deem necessary.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Changes to Terms</h3>
                <p className="text-muted-foreground">
                  We may modify these terms at any time. Continued use of the platform after changes 
                  constitutes acceptance of the new terms.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact</h3>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at legal@smartcooperativehub.rw
                </p>
              </div>
            </div>
          ),
        };
      default:
        return null;
    }
  };

  const dialogData = openDialog ? getDialogContent() : null;

  return (
    <>
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Smart Cooperative Hub" className="h-10 w-10 rounded" />
                <span className="text-lg font-bold text-[#8ccc15]">Smart Cooperative Hub</span>
              </div>
              <p className="text-muted-foreground">
                Empowering cooperatives through digital innovation and transparent marketplace solutions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#8ccc15] mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-muted-foreground hover:text-[#8ccc15]">Home</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-[#8ccc15]">About</a></li>
                <li><a href="#features" className="text-muted-foreground hover:text-[#8ccc15]">Features</a></li>
                <li><a href="/marketplace" className="text-muted-foreground hover:text-[#8ccc15]">Marketplace</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#8ccc15] mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => handleResourceClick(e, "documentation")}
                    className="text-muted-foreground hover:text-[#8ccc15] cursor-pointer"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => handleResourceClick(e, "support")}
                    className="text-muted-foreground hover:text-[#8ccc15] cursor-pointer"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => handleResourceClick(e, "privacy")}
                    className="text-muted-foreground hover:text-[#8ccc15] cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => handleResourceClick(e, "terms")}
                    className="text-muted-foreground hover:text-[#8ccc15] cursor-pointer"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#8ccc15] mb-4">Connect With Us</h3>
              <div className="flex gap-3">
                <a href="#" className="h-10 w-10 rounded-full bg-[#8ccc15] flex items-center justify-center text-white hover:bg-[#8ccc15]">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-[#8ccc15] flex items-center justify-center text-white hover:bg-[#8ccc15]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-[#8ccc15] flex items-center justify-center text-white hover:bg-[#8ccc15]">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-[#8ccc15] flex items-center justify-center text-white hover:bg-[#8ccc15]">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Smart Cooperative Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>

    {/* Resource Information Dialog */}
    <Dialog open={!!openDialog} onOpenChange={(open) => !open && setOpenDialog(null)}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dialogData?.icon}
            {dialogData?.title}
          </DialogTitle>
          <DialogDescription>
            {openDialog === "documentation" && "Comprehensive guide to using Smart Cooperative Hub"}
            {openDialog === "support" && "Get help and support for using our platform"}
            {openDialog === "privacy" && "How we protect and handle your personal information"}
            {openDialog === "terms" && "Terms and conditions for using Smart Cooperative Hub"}
          </DialogDescription>
        </DialogHeader>
        {dialogData?.content}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Footer;
