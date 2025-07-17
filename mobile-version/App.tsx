import React, { useState } from "react";
import svgPaths from "./imports/svg-qvt6gt9911";
import imgAvatars3DAvatar13 from "figma:asset/436985b609d053075017d7f78ccd2d5f7d059fcf.png";
import imgRectangle3 from "figma:asset/c9da98147ddcb539582a499b20c5af8da1104aa2.png";
import {
  ChevronDown,
  ChevronLeft,
  Bell,
  Plus,
  Search,
  MoreHorizontal,
  Home,
  Link2,
  Package2,
  CreditCard,
  Building2,
  ShieldCheck,
  Filter,
  Settings,
  LogOut,
  User,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  Globe,
  Copy,
  ExternalLink,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Bold,
  Italic,
  Type,
  Hash,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

// Types
interface PaymentField {
  id: string;
  name: string;
  value: string;
}

interface FormData {
  paymentMethodName: string;
  description: string;
  country: string;
  paymentType: string;
  paymentFields: PaymentField[];
  instructions: string;
  paymentUrl?: string;
}

interface CheckoutLinkFormData {
  title: string;
  linkName: string;
  brand: string;
  countries: string;
  checkoutType: "simple" | "product";
  paymentType: "fixed" | "customer";
  amount: string;
  product: string;
  productPrice: string;
}

interface ProductFormData {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  countries: string;
  status: "Active" | "Inactive" | "Draft";
  type: "manual" | "link";
  transactions: number;
  lastUsed: string;
  image?: string;
}

interface CheckoutLink {
  id: string;
  name: string;
  countries: string;
  status: "Active" | "Inactive" | "Draft";
  type: "simple" | "product";
  views: number;
  lastUsed: string;
  url: string;
}

interface PendingVerification {
  id: string;
  transactionId: string;
  amount: string;
  currency: string;
  date: string;
  customerName: string;
  paymentMethod: string;
  status: "pending";
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "Active" | "Inactive" | "Draft";
  image?: string;
  createdAt: string;
}

type Page =
  | "dashboard"
  | "create-manual"
  | "create-link"
  | "checkout-links"
  | "create-checkout-simple"
  | "create-checkout-product"
  | "verify"
  | "products"
  | "create-product";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] =
    useState(false);

  const [formData, setFormData] = useState<FormData>({
    paymentMethodName: "",
    description: "",
    country: "",
    paymentType: "manual",
    paymentFields: [],
    instructions: "",
    paymentUrl: "",
  });

  const [checkoutFormData, setCheckoutFormData] =
    useState<CheckoutLinkFormData>({
      title: "",
      linkName: "",
      brand: "",
      countries: "",
      checkoutType: "simple",
      paymentType: "fixed",
      amount: "",
      product: "",
      productPrice: "",
    });

  const [productFormData, setProductFormData] =
    useState<ProductFormData>({
      title: "",
      category: "",
      description: "",
      imageUrl: "",
    });

  const [showCountryDropdown, setShowCountryDropdown] =
    useState(false);
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] =
    useState(false);
  const [showBrandDropdown, setShowBrandDropdown] =
    useState(false);
  const [showProductDropdown, setShowProductDropdown] =
    useState(false);
  const [
    showCheckoutCountryDropdown,
    setShowCheckoutCountryDropdown,
  ] = useState(false);
  const [
    showCheckoutPaymentTypeDropdown,
    setShowCheckoutPaymentTypeDropdown,
  ] = useState(false);
  const [
    showVerificationActionDropdown,
    setShowVerificationActionDropdown,
  ] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] =
    useState(false);

  // Mock payment methods data
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethod[]
  >([
    {
      id: "1",
      name: "Bank Transfer",
      countries: "US, CA, UK, FR",
      status: "Active",
      type: "manual",
      transactions: 1247,
      lastUsed: "2 hours ago",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: "2",
      name: "PayPal Link",
      countries: "US, CA, UK, FR, DE",
      status: "Active",
      type: "link",
      transactions: 2156,
      lastUsed: "30 minutes ago",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: "3",
      name: "Wire Transfer",
      countries: "Global",
      status: "Active",
      type: "manual",
      transactions: 892,
      lastUsed: "1 day ago",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: "4",
      name: "Stripe Payment Link",
      countries: "US, CA, UK",
      status: "Draft",
      type: "link",
      transactions: 0,
      lastUsed: "Never",
      image:
        "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: "5",
      name: "Cash Deposit",
      countries: "US, CA, UK, FR",
      status: "Active",
      type: "manual",
      transactions: 543,
      lastUsed: "3 hours ago",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: "6",
      name: "Payment Gateway Link",
      countries: "Global",
      status: "Inactive",
      type: "link",
      transactions: 1287,
      lastUsed: "2 days ago",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center",
    },
  ]);

  // Mock checkout links data
  const [checkoutLinks, setCheckoutLinks] = useState<
    CheckoutLink[]
  >([
    {
      id: "1",
      name: "Premium Product Checkout",
      countries: "US, CA, UK",
      status: "Active",
      type: "product",
      views: 324,
      lastUsed: "1 hour ago",
      url: "https://checkout.example.com/premium",
    },
    {
      id: "2",
      name: "Donation Link",
      countries: "Global",
      status: "Active",
      type: "simple",
      views: 1247,
      lastUsed: "30 minutes ago",
      url: "https://checkout.example.com/donate",
    },
    {
      id: "3",
      name: "Service Payment",
      countries: "US, CA, UK, FR",
      status: "Active",
      type: "simple",
      views: 892,
      lastUsed: "2 hours ago",
      url: "https://checkout.example.com/service",
    },
    {
      id: "4",
      name: "Product Bundle",
      countries: "US, CA",
      status: "Draft",
      type: "product",
      views: 0,
      lastUsed: "Never",
      url: "https://checkout.example.com/bundle",
    },
    {
      id: "5",
      name: "Subscription Payment",
      countries: "Global",
      status: "Active",
      type: "simple",
      views: 567,
      lastUsed: "45 minutes ago",
      url: "https://checkout.example.com/subscription",
    },
  ]);

  // Mock pending verifications data
  const [pendingVerifications, setPendingVerifications] =
    useState<PendingVerification[]>([
      {
        id: "1",
        transactionId: "TXN-001",
        amount: "1000",
        currency: "USD",
        date: "2025-01-12",
        customerName: "John Doe",
        paymentMethod: "Bank Transfer",
        status: "pending",
      },
      {
        id: "2",
        transactionId: "TXN-002",
        amount: "750",
        currency: "USD",
        date: "2025-01-12",
        customerName: "Jane Smith",
        paymentMethod: "PayPal",
        status: "pending",
      },
      {
        id: "3",
        transactionId: "TXN-003",
        amount: "2500",
        currency: "USD",
        date: "2025-01-12",
        customerName: "Mike Johnson",
        paymentMethod: "Wire Transfer",
        status: "pending",
      },
      {
        id: "4",
        transactionId: "TXN-004",
        amount: "500",
        currency: "USD",
        date: "2025-01-12",
        customerName: "Sarah Wilson",
        paymentMethod: "Credit Card",
        status: "pending",
      },
      {
        id: "5",
        transactionId: "TXN-005",
        amount: "1250",
        currency: "USD",
        date: "2025-01-12",
        customerName: "David Brown",
        paymentMethod: "Bank Transfer",
        status: "pending",
      },
      {
        id: "6",
        transactionId: "TXN-006",
        amount: "900",
        currency: "USD",
        date: "2025-01-12",
        customerName: "Emily Davis",
        paymentMethod: "PayPal",
        status: "pending",
      },
    ]);

  // Mock products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Premium Online Course",
      description:
        "Comprehensive digital marketing course with video content",
      category: "Digital",
      status: "Active",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=center",
      createdAt: "2 days ago",
    },
    {
      id: "2",
      name: "Consulting Service",
      description: "One-on-one business consulting sessions",
      category: "Service",
      status: "Active",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop&crop=center",
      createdAt: "1 week ago",
    },
    {
      id: "3",
      name: "Software License",
      description:
        "Annual subscription for premium software features",
      category: "Software",
      status: "Active",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=center",
      createdAt: "3 days ago",
    },
    {
      id: "4",
      name: "E-book Collection",
      description: "Complete guide to digital entrepreneurship",
      category: "Digital",
      status: "Draft",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
      createdAt: "5 days ago",
    },
    {
      id: "5",
      name: "Physical Product",
      description:
        "High-quality merchandise with custom branding",
      category: "Physical",
      status: "Active",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
      createdAt: "1 day ago",
    },
  ]);

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Brazil",
    "India",
    "China",
  ];

  const brands = [
    "TechCorp Inc.",
    "Digital Solutions",
    "Creative Agency",
    "E-commerce Store",
    "Consulting Firm",
    "Marketing Agency",
  ];

  const productsData = [
    "Premium Software License",
    "Consulting Package",
    "Digital Course",
    "E-book Collection",
    "Monthly Subscription",
    "One-time Service",
  ];

  const categories = [
    "Digital Products",
    "Physical Products",
    "Services",
    "Software",
    "Education",
    "E-Commerce",
  ];

  const paymentTypes = [
    { value: "manual", label: "Manual payment method" },
    { value: "link", label: "Payment Link" },
  ];

  // Payment type options for checkout links
  const checkoutPaymentTypes = [
    { value: "fixed", label: "Amount customer will pay" },
    {
      value: "customer",
      label: "Let customer input his amount",
    },
  ];

  // Filter options for payment methods
  const filterOptions = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "draft", label: "Draft" },
    { id: "manual", label: "Manual" },
    { id: "link", label: "Links" },
  ];

  // Filter options for checkout links
  const checkoutFilterOptions = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "draft", label: "Draft" },
    { id: "simple", label: "Simple" },
    { id: "product", label: "Product" },
  ];

  // Filter options for verifications
  const verificationFilterOptions = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
  ];

  // Filter options for products
  const productFilterOptions = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "draft", label: "Draft" },
    { id: "digital", label: "Digital" },
    { id: "physical", label: "Physical" },
    { id: "service", label: "Service" },
  ];

  // Helper function to get payment method image
  const getPaymentMethodImage = (paymentMethodName: string) => {
    const paymentMethodMap: { [key: string]: string } = {
      "Bank Transfer":
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&crop=center",
      PayPal:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center",
      "Wire Transfer":
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop&crop=center",
      "Credit Card":
        "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=100&h=100&fit=crop&crop=center",
      "Cash Deposit":
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop&crop=center",
    };

    return (
      paymentMethodMap[paymentMethodName] ||
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center"
    );
  };

  // Form handlers for payment methods
  const handleInputChange = (
    field: keyof FormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Form handlers for checkout links
  const handleCheckoutInputChange = (
    field: keyof CheckoutLinkFormData,
    value: string,
  ) => {
    setCheckoutFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Form handlers for products
  const handleProductInputChange = (
    field: keyof ProductFormData,
    value: string,
  ) => {
    setProductFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPaymentField = () => {
    const newField: PaymentField = {
      id: Date.now().toString(),
      name: `Field ${formData.paymentFields.length + 1}`,
      value: "",
    };
    setFormData((prev) => ({
      ...prev,
      paymentFields: [...prev.paymentFields, newField],
    }));
  };

  const updatePaymentField = (
    id: string,
    field: "name" | "value",
    newValue: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentFields: prev.paymentFields.map((f) =>
        f.id === id ? { ...f, [field]: newValue } : f,
      ),
    }));
  };

  const removePaymentField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentFields: prev.paymentFields.filter(
        (f) => f.id !== id,
      ),
    }));
  };

  const handleSubmit = () => {
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      name: formData.paymentMethodName,
      countries: formData.country,
      status: "Active",
      type: currentPage === "create-link" ? "link" : "manual",
      transactions: 0,
      lastUsed: "Never",
      image:
        formData.paymentType === "link"
          ? "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center"
          : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&crop=center",
    };

    setPaymentMethods((prev) => [...prev, newPaymentMethod]);

    // Reset form
    setFormData({
      paymentMethodName: "",
      description: "",
      country: "",
      paymentType: "manual",
      paymentFields: [],
      instructions: "",
      paymentUrl: "",
    });

    setCurrentPage("dashboard");
    alert("Payment method created successfully!");
  };

  const handleCheckoutSubmit = () => {
    const newCheckoutLink: CheckoutLink = {
      id: Date.now().toString(),
      name: checkoutFormData.title,
      countries: checkoutFormData.countries,
      status: "Active",
      type: checkoutFormData.checkoutType,
      views: 0,
      lastUsed: "Never",
      url: `https://checkout.example.com/${checkoutFormData.linkName.toLowerCase().replace(/\s+/g, "-")}`,
    };

    setCheckoutLinks((prev) => [...prev, newCheckoutLink]);

    // Reset form
    setCheckoutFormData({
      title: "",
      linkName: "",
      brand: "",
      countries: "",
      checkoutType: "simple",
      paymentType: "fixed",
      amount: "",
      product: "",
      productPrice: "",
    });

    setCurrentPage("checkout-links");
    alert("Checkout link created successfully!");
  };

  const handleProductSubmit = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productFormData.title,
      description: productFormData.description,
      category: productFormData.category,
      status: "Active",
      image:
        productFormData.imageUrl ||
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=center",
      createdAt: "Just now",
    };

    setProducts((prev) => [...prev, newProduct]);

    // Reset form
    setProductFormData({
      title: "",
      category: "",
      description: "",
      imageUrl: "",
    });

    setCurrentPage("products");
    alert("Product created successfully!");
  };

  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? All changes will be lost.",
      )
    ) {
      if (currentPage.includes("checkout")) {
        setCheckoutFormData({
          title: "",
          linkName: "",
          brand: "",
          countries: "",
          checkoutType: "simple",
          paymentType: "fixed",
          amount: "",
          product: "",
          productPrice: "",
        });
        setCurrentPage("checkout-links");
      } else if (currentPage === "create-product") {
        setProductFormData({
          title: "",
          category: "",
          description: "",
          imageUrl: "",
        });
        setCurrentPage("products");
      } else {
        setFormData({
          paymentMethodName: "",
          description: "",
          country: "",
          paymentType: "manual",
          paymentFields: [],
          instructions: "",
          paymentUrl: "",
        });
        setCurrentPage("dashboard");
      }
    }
  };

  // Verification handlers
  const handleApproveTransaction = (id: string) => {
    setPendingVerifications((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
    setShowVerificationActionDropdown(null);
    alert("Transaction approved successfully!");
  };

  const handleRejectTransaction = (id: string) => {
    setPendingVerifications((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
    setShowVerificationActionDropdown(null);
    alert("Transaction rejected successfully!");
  };

  const isFormValid =
    formData.paymentMethodName.trim() && formData.country;
  const isCheckoutFormValid =
    checkoutFormData.title.trim() &&
    checkoutFormData.linkName.trim() &&
    checkoutFormData.brand.trim() &&
    checkoutFormData.countries.trim();
  const isProductFormValid =
    productFormData.title.trim() &&
    productFormData.category.trim();

  function CploredLogo() {
    return (
      <div className="size-[32px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 68 68"
        >
          <g>
            <path d={svgPaths.p2fd1600} fill="#6F56E5" />
            <path d={svgPaths.pdd3dd80} fill="#A16FFC" />
            <path d={svgPaths.p30069600} fill="#9D6EEC" />
            <path d={svgPaths.p2381b300} fill="#936BDE" />
            <path d={svgPaths.p21701200} fill="#7C61E6" />
            <path d={svgPaths.p3eb495c0} fill="#9873D7" />
            <path d={svgPaths.pdef6e00} fill="#956AE5" />
            <path d={svgPaths.p1e832e00} fill="#BA79FE" />
            <path d={svgPaths.p3ddaaf80} fill="#8462DA" />
            <path d={svgPaths.p16e70f70} fill="#594BB2" />
          </g>
        </svg>
      </div>
    );
  }

  // Filter methods based on active filter and search term
  const filteredMethods = paymentMethods.filter((method) => {
    const matchesSearch = method.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      method.status.toLowerCase() === activeFilter ||
      method.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter checkout links based on active filter and search term
  const filteredCheckoutLinks = checkoutLinks.filter((link) => {
    const matchesSearch = link.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      link.status.toLowerCase() === activeFilter ||
      link.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter pending verifications based on active filter and search term
  const filteredVerifications = pendingVerifications.filter(
    (verification) => {
      const matchesSearch =
        verification.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        verification.paymentMethod
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        verification.transactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ||
        activeFilter === "pending" ||
        (activeFilter === "today" &&
          verification.date === "2025-01-12") ||
        activeFilter === "week";
      return matchesSearch && matchesFilter;
    },
  );

  // Filter products based on active filter and search term
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      product.status.toLowerCase() === activeFilter ||
      product.category.toLowerCase().includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  const totalTransactions = paymentMethods.reduce(
    (sum, method) => sum + method.transactions,
    0,
  );
  const totalViews = checkoutLinks.reduce(
    (sum, link) => sum + link.views,
    0,
  );
  const totalProducts = products.length;
  const activeProducts = products.filter(
    (p) => p.status === "Active",
  ).length;

  // Get current filter label
  const getCurrentFilterOptions = () => {
    switch (currentPage) {
      case "checkout-links":
        return checkoutFilterOptions;
      case "verify":
        return verificationFilterOptions;
      case "products":
        return productFilterOptions;
      default:
        return filterOptions;
    }
  };

  const currentFilterLabel =
    getCurrentFilterOptions().find(
      (filter) => filter.id === activeFilter,
    )?.label || "All";

  // Navigation handler
  const handleNavigation = (pageId: string) => {
    setActiveFilter("all"); // Reset filter when switching pages
    setSearchTerm(""); // Reset search when switching pages

    switch (pageId) {
      case "methods":
        setCurrentPage("dashboard");
        break;
      case "links":
        setCurrentPage("checkout-links");
        break;
      case "verify":
        setCurrentPage("verify");
        break;
      case "products":
        setCurrentPage("products");
        break;
      default:
        // Handle other navigation items if needed
        break;
    }
  };

  // Products Dashboard
  function ProductsDashboard() {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[403px] min-h-screen mx-auto relative shadow-lg">
          {/* Header - Fixed at top */}
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white z-20 border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <CploredLogo />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowNotifications(!showNotifications)
                    }
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell className="size-5 text-gray-600" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-30">
                      <h3 className="font-semibold mb-3 text-gray-900">
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              New product created
                            </p>
                            <p className="text-xs text-gray-500">
                              5 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              Product updated
                            </p>
                            <p className="text-xs text-gray-500">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              2 products pending review
                            </p>
                            <p className="text-xs text-gray-500">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowUserMenu(!showUserMenu)
                    }
                    className="size-9 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                    style={{
                      backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                    }}
                  />
                  {showUserMenu && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 z-30">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <User className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Profile
                        </span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Settings
                        </span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="size-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="pt-20 pb-20 overflow-y-auto h-screen">
            {/* Header Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    Products
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage products for your checkout
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage("create-product")
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="size-4" />
                  Add Product
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {totalProducts}
                      </p>
                    </div>
                    <Package2 className="size-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Active Products
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {activeProducts}
                      </p>
                    </div>
                    <CheckCircle className="size-8 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowFilterDropdown(
                          !showFilterDropdown,
                        )
                      }
                      className="px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Filter className="size-4 text-gray-400" />
                      <span>{currentFilterLabel}</span>
                      <ChevronDown className="size-4 text-gray-400" />
                    </button>
                    {showFilterDropdown && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-40 z-30">
                        {productFilterOptions.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => {
                              setActiveFilter(filter.id);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                              activeFilter === filter.id
                                ? "text-purple-600 bg-purple-50 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="px-6 pb-4">
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package2 className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by creating your first product"}
                    </p>
                    <button
                      onClick={() =>
                        setCurrentPage("create-product")
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus className="size-4" />
                      Add Product
                    </button>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="size-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                              src={
                                product.image ||
                                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=center"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate flex-shrink">
                                {product.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                  product.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : product.status ===
                                        "Inactive"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {product.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Package2 className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {product.category}
                                </span>
                              </div>
                              <span className="text-gray-300 flex-shrink-0">
                                •
                              </span>
                              <div className="flex items-center gap-1 flex-shrink min-w-0">
                                <Clock className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {product.createdAt}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="size-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="size-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white border-t border-gray-200 z-20">
            <div className="flex items-center justify-around py-3">
              {[
                { icon: Home, label: "Home", id: "home" },
                { icon: Link2, label: "Links", id: "links" },
                {
                  icon: Package2,
                  label: "Products",
                  id: "products",
                  active: true,
                },
                {
                  icon: CreditCard,
                  label: "Methods",
                  id: "methods",
                },
                {
                  icon: Building2,
                  label: "Brands",
                  id: "brands",
                },
                {
                  icon: ShieldCheck,
                  label: "Verify",
                  id: "verify",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                    item.active
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="size-5 mb-1" />
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Product Form
  function CreateProductForm() {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[393px] min-h-screen mx-auto relative">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage("products")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
              >
                <ChevronLeft className="size-5 text-gray-700" />
              </button>
              <CploredLogo />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="size-4 text-gray-600" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                {showNotifications && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-20">
                    <h3 className="font-medium mb-2 text-gray-900">
                      Notifications
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>New product created</p>
                      <p>Product updated</p>
                      <p>2 products pending review</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="size-8 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                  style={{
                    backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                  }}
                />
                {showUserMenu && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-44 z-20">
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Profile
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Settings
                      </span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="size-4 text-red-500" />
                      <span className="text-sm text-red-600">
                        Logout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Title Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex justify-end">
              <div className="text-right">
                <h1 className="text-xl font-semibold text-gray-900">
                  Create Product
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Add a new product to your catalog
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-4 pb-16 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-10 pt-4">
              {/* Basic Information Section */}
              <div>
                <h2 className="font-medium text-gray-900 mb-1">
                  Basic Information
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Fill in the essential information about your
                  product
                </p>

                <div className="space-y-4">
                  {/* Product Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Product Title{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Premium Online Course"
                      value={productFormData.title}
                      onChange={(e) =>
                        handleProductInputChange(
                          "title",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2.5 bg-gray-100 rounded-md text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be the main heading customers
                      see
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Category{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowCategoryDropdown(
                            !showCategoryDropdown,
                          )
                        }
                        className="w-full px-4 py-2.5 bg-gray-100 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 transition-all text-left"
                      >
                        {productFormData.category ||
                          "Digital Products"}
                      </button>
                      {showCategoryDropdown && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 z-10 shadow-sm">
                          {categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => {
                                handleProductInputChange(
                                  "category",
                                  category,
                                );
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Product Image
                    </label>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">
                        Enter image URL
                      </p>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={productFormData.imageUrl}
                        onChange={(e) =>
                          handleProductInputChange(
                            "imageUrl",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2.5 bg-gray-100 rounded-md text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Product Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Describe your product..."
                      value={productFormData.description}
                      onChange={(e) =>
                        handleProductInputChange(
                          "description",
                          e.target.value,
                        )
                      }
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-100 rounded-md text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Briefly describe the product to your
                      customers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Preview Section */}
              <div>
                <h2 className="font-medium text-gray-900 mb-1">
                  Live Preview
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  See how your product will look to customers
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  {/* Preview Image */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    {productFormData.imageUrl ? (
                      <ImageWithFallback
                        src={productFormData.imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <p className="text-xs text-gray-500">
                        No image uploaded
                      </p>
                    )}
                  </div>

                  {/* Preview Content */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {productFormData.title ||
                        "Your Product Title"}
                    </h3>
                    {productFormData.category && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                        {productFormData.category}
                      </span>
                    )}
                    <p className="text-sm text-gray-600 mb-3">
                      {productFormData.description ||
                        "Your product description will appear here..."}
                    </p>
                    <div className="text-xs text-gray-500">
                      Pricing will be configured when creating
                      checkout links
                    </div>
                  </div>
                </div>

                {/* Preview Tips */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm">
                    Preview Tips
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>
                      • Upload high-quality images for best
                      results
                    </li>
                    <li>
                      • Pricing will be set when creating
                      checkout links
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Buttons */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] bg-white border-t border-gray-200 p-4 z-20">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProductSubmit}
                disabled={!isProductFormValid}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isProductFormValid
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Payment Method Form
  function CreatePaymentMethodForm() {
    const isPaymentLink = currentPage === "create-link";

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[393px] min-h-screen mx-auto relative">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
              >
                <ChevronLeft className="size-5 text-gray-700" />
              </button>
              <CploredLogo />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="size-4 text-gray-600" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                {showNotifications && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-20">
                    <h3 className="font-medium mb-2 text-gray-900">
                      Notifications
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>New payment method created</p>
                      <p>Bank Transfer status updated</p>
                      <p>3 pending approvals</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="size-8 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                  style={{
                    backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                  }}
                />
                {showUserMenu && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-44 z-20">
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Profile
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Settings
                      </span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="size-4 text-red-500" />
                      <span className="text-sm text-red-600">
                        Logout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Title Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex justify-end">
              <div className="text-right">
                <h1 className="text-xl font-semibold text-gray-900">
                  Create Payment Method
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isPaymentLink
                    ? "Set up a payment link"
                    : "Configure manual payment details"}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Payment Type Toggle */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => {
                  setCurrentPage("create-manual");
                  setFormData((prev) => ({
                    ...prev,
                    paymentType: "manual",
                  }));
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "create-manual"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => {
                  setCurrentPage("create-link");
                  setFormData((prev) => ({
                    ...prev,
                    paymentType: "link",
                  }));
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "create-link"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Payment Link
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-4 pb-24 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-4 pt-4">
              {/* Payment Method Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Payment Method Name
                </label>
                <input
                  type="text"
                  placeholder="Enter payment method name"
                  value={formData.paymentMethodName}
                  onChange={(e) =>
                    handleInputChange(
                      "paymentMethodName",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief description of the payment method"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange(
                      "description",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCountryDropdown(
                        !showCountryDropdown,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                  >
                    <span
                      className={
                        formData.country
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {formData.country || "Select country"}
                    </span>
                    <ChevronDown className="size-4 text-gray-400" />
                  </button>
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                      {countries.map((country) => (
                        <button
                          key={country}
                          onClick={() => {
                            handleInputChange(
                              "country",
                              country,
                            );
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Payment Type
                </label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowPaymentTypeDropdown(
                        !showPaymentTypeDropdown,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                  >
                    <span>
                      {isPaymentLink
                        ? "Payment Link"
                        : "Manual payment method"}
                    </span>
                    <ChevronDown className="size-4 text-gray-400" />
                  </button>
                  {showPaymentTypeDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                      {paymentTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            handleInputChange(
                              "paymentType",
                              type.value,
                            );
                            if (type.value === "manual") {
                              setCurrentPage("create-manual");
                            } else if (type.value === "link") {
                              setCurrentPage("create-link");
                            }
                            setShowPaymentTypeDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Conditional Content Based on Payment Type */}
              {isPaymentLink ? (
                // Payment URL for Payment Link
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Payment URL
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Users will be redirected to this link to
                    complete payment
                  </p>
                  <input
                    type="url"
                    placeholder="https://example.com/payment"
                    value={formData.paymentUrl}
                    onChange={(e) =>
                      handleInputChange(
                        "paymentUrl",
                        e.target.value,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              ) : (
                // Payment Details for Manual Payment
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">
                        Payment Details
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Add the fields customers need to provide
                      </p>
                    </div>
                    <button
                      onClick={addPaymentField}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  {formData.paymentFields.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-5 text-center">
                      <Wallet className="size-7 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">
                        No payment fields configured
                      </p>
                      <button
                        onClick={addPaymentField}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Plus className="size-4" />
                        Add first field
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.paymentFields.map(
                        (field, index) => (
                          <div
                            key={field.id}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Field {index + 1}
                              </span>
                              <button
                                onClick={() =>
                                  removePaymentField(field.id)
                                }
                                className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
                              >
                                <span className="text-lg leading-none">
                                  ×
                                </span>
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Field label (e.g., Account Number)"
                                value={field.name}
                                onChange={(e) =>
                                  updatePaymentField(
                                    field.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                              <input
                                type="text"
                                placeholder="Example value (e.g., 123456789)"
                                value={field.value}
                                onChange={(e) =>
                                  updatePaymentField(
                                    field.id,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                              />
                            </div>
                          </div>
                        ),
                      )}

                      {/* Country Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {["US", "FR", "CM", "UK"].map(
                          (country) => (
                            <span
                              key={country}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {country}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions - Only for Manual Payment */}
              {!isPaymentLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Instructions
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Provide clear instructions for customers
                  </p>
                  <textarea
                    placeholder="Enter specific instructions for this country..."
                    value={formData.instructions}
                    onChange={(e) =>
                      handleInputChange(
                        "instructions",
                        e.target.value,
                      )
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Action Buttons */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] bg-white border-t border-gray-200 p-4 z-20">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isFormValid
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Create Method
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Methods Dashboard
  function PaymentMethodsDashboard() {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[403px] min-h-screen mx-auto relative shadow-lg">
          {/* Header - Fixed at top */}
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white z-20 border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <CploredLogo />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowNotifications(!showNotifications)
                    }
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell className="size-5 text-gray-600" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-30">
                      <h3 className="font-semibold mb-3 text-gray-900">
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              Bank Transfer activated
                            </p>
                            <p className="text-xs text-gray-500">
                              2 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              247 transactions processed
                            </p>
                            <p className="text-xs text-gray-500">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              3 methods pending review
                            </p>
                            <p className="text-xs text-gray-500">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowUserMenu(!showUserMenu)
                    }
                    className="size-9 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                    style={{
                      backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                    }}
                  />
                  {showUserMenu && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 z-30">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <User className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Profile
                        </span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Settings
                        </span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="size-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="pt-20 pb-20 overflow-y-auto h-screen">
            {/* Header Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    Payment Methods
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your payment options
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage("create-manual")
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="size-4" />
                  Create
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Total Methods
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {paymentMethods.length}
                      </p>
                    </div>
                    <CreditCard className="size-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Transactions
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {totalTransactions.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="size-8 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search payment methods..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowFilterDropdown(
                          !showFilterDropdown,
                        )
                      }
                      className="px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Filter className="size-4 text-gray-400" />
                      <span>{currentFilterLabel}</span>
                      <ChevronDown className="size-4 text-gray-400" />
                    </button>
                    {showFilterDropdown && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-40 z-30">
                        {filterOptions.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => {
                              setActiveFilter(filter.id);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                              activeFilter === filter.id
                                ? "text-purple-600 bg-purple-50 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods List */}
            <div className="px-6 pb-4">
              <div className="space-y-3">
                {filteredMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No payment methods found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by creating your first payment method"}
                    </p>
                    <button
                      onClick={() =>
                        setCurrentPage("create-manual")
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus className="size-4" />
                      Create Payment Method
                    </button>
                  </div>
                ) : (
                  filteredMethods.map((method) => (
                    <div
                      key={method.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="size-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                              src={
                                method.image ||
                                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&crop=center"
                              }
                              alt={method.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate flex-shrink">
                                {method.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                  method.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : method.status ===
                                        "Inactive"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {method.status}
                              </span>
                              <span className="text-xs text-gray-500 capitalize flex-shrink-0">
                                {method.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Globe className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-[60px]">
                                  {method.countries}
                                </span>
                              </div>
                              <span className="text-gray-300 flex-shrink-0">
                                •
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <TrendingUp className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {method.transactions.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-gray-300 flex-shrink-0">
                                •
                              </span>
                              <div className="flex items-center gap-1 flex-shrink min-w-0">
                                <Clock className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {method.lastUsed}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="size-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="size-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white border-t border-gray-200 z-20">
            <div className="flex items-center justify-around py-3">
              {[
                { icon: Home, label: "Home", id: "home" },
                { icon: Link2, label: "Links", id: "links" },
                {
                  icon: Package2,
                  label: "Products",
                  id: "products",
                },
                {
                  icon: CreditCard,
                  label: "Methods",
                  id: "methods",
                  active: true,
                },
                {
                  icon: Building2,
                  label: "Brands",
                  id: "brands",
                },
                {
                  icon: ShieldCheck,
                  label: "Verify",
                  id: "verify",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                    item.active
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="size-5 mb-1" />
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification Dashboard
  function VerificationDashboard() {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[403px] min-h-screen mx-auto relative shadow-lg">
          {/* Header - Fixed at top */}
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white z-20 border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <CploredLogo />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowNotifications(!showNotifications)
                    }
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell className="size-5 text-gray-600" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-30">
                      <h3 className="font-semibold mb-3 text-gray-900">
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              Transaction verified
                            </p>
                            <p className="text-xs text-gray-500">
                              5 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              6 transactions pending
                              verification
                            </p>
                            <p className="text-xs text-gray-500">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              Transaction rejected
                            </p>
                            <p className="text-xs text-gray-500">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowUserMenu(!showUserMenu)
                    }
                    className="size-9 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                    style={{
                      backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                    }}
                  />
                  {showUserMenu && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 z-30">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <User className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Profile
                        </span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Settings
                        </span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="size-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="pt-20 pb-20 overflow-y-auto h-screen">
            {/* Header Section */}
            <div className="px-6 py-4">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Pending Verifications
                </h1>
                <p className="text-sm text-gray-500">
                  Payments that need your verification
                </p>
              </div>

              {/* Search and Filter */}
              <div className="mb-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowFilterDropdown(
                          !showFilterDropdown,
                        )
                      }
                      className="px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Filter className="size-4 text-gray-400" />
                      <span>{currentFilterLabel}</span>
                      <ChevronDown className="size-4 text-gray-400" />
                    </button>
                    {showFilterDropdown && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-40 z-30">
                        {verificationFilterOptions.map(
                          (filter) => (
                            <button
                              key={filter.id}
                              onClick={() => {
                                setActiveFilter(filter.id);
                                setShowFilterDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                                activeFilter === filter.id
                                  ? "text-purple-600 bg-purple-50 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {filter.label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Cards */}
            <div className="px-6 pb-4">
              <div className="space-y-3">
                {filteredVerifications.length === 0 ? (
                  <div className="text-center py-12">
                    <ShieldCheck className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No verifications found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "All transactions have been processed"}
                    </p>
                  </div>
                ) : (
                  filteredVerifications.map((verification) => (
                    <div
                      key={verification.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="size-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <ImageWithFallback
                              src={getPaymentMethodImage(
                                verification.paymentMethod,
                              )}
                              alt={verification.paymentMethod}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 flex-shrink">
                                {verification.amount}{" "}
                                {verification.currency}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex-shrink-0">
                                Pending
                              </span>
                            </div>
                            <div className="mb-1">
                              <p className="text-sm font-medium text-gray-700">
                                {verification.paymentMethod}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <User className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-[100px]">
                                  {verification.customerName}
                                </span>
                              </div>
                              <span className="text-gray-300 flex-shrink-0">
                                •
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Clock className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  Today
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                          <button
                            onClick={() =>
                              alert(
                                `Viewing transaction ${verification.transactionId} for ${verification.customerName}`,
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="size-4 text-gray-400" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowVerificationActionDropdown(
                                  showVerificationActionDropdown ===
                                    verification.id
                                    ? null
                                    : verification.id,
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="size-4 text-gray-400" />
                            </button>
                            {showVerificationActionDropdown ===
                              verification.id && (
                              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-32 z-30">
                                <button
                                  onClick={() =>
                                    handleApproveTransaction(
                                      verification.id,
                                    )
                                  }
                                  className="w-full px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle className="size-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectTransaction(
                                      verification.id,
                                    )
                                  }
                                  className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  <XCircle className="size-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white border-t border-gray-200 z-20">
            <div className="flex items-center justify-around py-3">
              {[
                { icon: Home, label: "Home", id: "home" },
                { icon: Link2, label: "Links", id: "links" },
                {
                  icon: Package2,
                  label: "Products",
                  id: "products",
                },
                {
                  icon: CreditCard,
                  label: "Methods",
                  id: "methods",
                },
                {
                  icon: Building2,
                  label: "Brands",
                  id: "brands",
                },
                {
                  icon: ShieldCheck,
                  label: "Verify",
                  id: "verify",
                  active: true,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                    item.active
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="size-5 mb-1" />
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Links Dashboard
  function CheckoutLinksDashboard() {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[403px] min-h-screen mx-auto relative shadow-lg">
          {/* Header - Fixed at top */}
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white z-20 border-b border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <CploredLogo />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowNotifications(!showNotifications)
                    }
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell className="size-5 text-gray-600" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
                  </button>
                  {showNotifications && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-30">
                      <h3 className="font-semibold mb-3 text-gray-900">
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              New checkout link created
                            </p>
                            <p className="text-xs text-gray-500">
                              5 minutes ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              147 views this week
                            </p>
                            <p className="text-xs text-gray-500">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm text-gray-900">
                              2 links pending review
                            </p>
                            <p className="text-xs text-gray-500">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowUserMenu(!showUserMenu)
                    }
                    className="size-9 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                    style={{
                      backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                    }}
                  />
                  {showUserMenu && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 z-30">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <User className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Profile
                        </span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="size-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Settings
                        </span>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="size-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="pt-20 pb-20 overflow-y-auto h-screen">
            {/* Header Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    Checkout Links
                  </h1>
                  <p className="text-sm text-gray-500">
                    Maanage checkout links for your customers
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCurrentPage("create-checkout-simple")
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="size-4" />
                  Create
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Total Links
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {checkoutLinks.length}
                      </p>
                    </div>
                    <Link2 className="size-8 text-purple-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Total Views
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {totalViews.toLocaleString()}
                      </p>
                    </div>
                    <Eye className="size-8 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mb-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search checkout links..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowFilterDropdown(
                          !showFilterDropdown,
                        )
                      }
                      className="px-4 py-3 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Filter className="size-4 text-gray-400" />
                      <span>{currentFilterLabel}</span>
                      <ChevronDown className="size-4 text-gray-400" />
                    </button>
                    {showFilterDropdown && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-40 z-30">
                        {checkoutFilterOptions.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => {
                              setActiveFilter(filter.id);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                              activeFilter === filter.id
                                ? "text-purple-600 bg-purple-50 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Links List */}
            <div className="px-6 pb-4">
              <div className="space-y-3">
                {filteredCheckoutLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <Link2 className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No checkout links found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by creating your first checkout link"}
                    </p>
                    <button
                      onClick={() =>
                        setCurrentPage("create-checkout-simple")
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Plus className="size-4" />
                      Create Checkout Link
                    </button>
                  </div>
                ) : (
                  filteredCheckoutLinks.map((link) => (
                    <div
                      key={link.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Link2 className="size-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate flex-shrink">
                                {link.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                  link.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : link.status === "Inactive"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {link.status}
                              </span>
                              <span className="text-xs text-gray-500 capitalize flex-shrink-0">
                                {link.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Globe className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-[60px]">
                                  {link.countries}
                                </span>
                              </div>
                              <span className="text-gray-300 flex-shrink-0">
                                •
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Eye className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {link.views.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-gray-300 flex-shrink-0">
                                •
                              </span>
                              <div className="flex items-center gap-1 flex-shrink min-w-0">
                                <Clock className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {link.lastUsed}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Copy className="size-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ExternalLink className="size-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal className="size-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[403px] bg-white border-t border-gray-200 z-20">
            <div className="flex items-center justify-around py-3">
              {[
                { icon: Home, label: "Home", id: "home" },
                {
                  icon: Link2,
                  label: "Links",
                  id: "links",
                  active: true,
                },
                {
                  icon: Package2,
                  label: "Products",
                  id: "products",
                },
                {
                  icon: CreditCard,
                  label: "Methods",
                  id: "methods",
                },
                {
                  icon: Building2,
                  label: "Brands",
                  id: "brands",
                },
                {
                  icon: ShieldCheck,
                  label: "Verify",
                  id: "verify",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                    item.active
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="size-5 mb-1" />
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Checkout Link Form
  function CreateCheckoutLinkForm() {
    const isProductLink =
      currentPage === "create-checkout-product";

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white w-full max-w-[393px] min-h-screen mx-auto relative">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage("checkout-links")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
              >
                <ChevronLeft className="size-5 text-gray-700" />
              </button>
              <CploredLogo />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="size-4 text-gray-600" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                {showNotifications && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-20">
                    <h3 className="font-medium mb-2 text-gray-900">
                      Notifications
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>New checkout link created</p>
                      <p>Link performance updated</p>
                      <p>2 links pending review</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="size-8 rounded-full bg-cover bg-center hover:ring-2 hover:ring-purple-300 transition-all"
                  style={{
                    backgroundImage: `url('${imgAvatars3DAvatar13}')`,
                  }}
                />
                {showUserMenu && (
                  <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-44 z-20">
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Profile
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Settings
                      </span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="size-4 text-red-500" />
                      <span className="text-sm text-red-600">
                        Logout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Title Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex justify-end">
              <div className="text-right">
                <h1 className="text-xl font-semibold text-gray-900">
                  Create Checkout Link
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isProductLink
                    ? "Set up a product checkout link"
                    : "Create a simple checkout link"}
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Type Toggle */}
          <div className="px-4 py-3 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select checkout type
            </label>
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => {
                  setCurrentPage("create-checkout-simple");
                  setCheckoutFormData((prev) => ({
                    ...prev,
                    checkoutType: "simple",
                  }));
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "create-checkout-simple"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Simple link
              </button>
              <button
                onClick={() => {
                  setCurrentPage("create-checkout-product");
                  setCheckoutFormData((prev) => ({
                    ...prev,
                    checkoutType: "product",
                  }));
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "create-checkout-product"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Product link
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-4 pb-24 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-4 pt-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Checkout link title"
                  value={checkoutFormData.title}
                  onChange={(e) =>
                    handleCheckoutInputChange(
                      "title",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Link Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Link name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Checkout link name"
                  value={checkoutFormData.linkName}
                  onChange={(e) =>
                    handleCheckoutInputChange(
                      "linkName",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Brand<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowBrandDropdown(!showBrandDropdown)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                  >
                    <span
                      className={
                        checkoutFormData.brand
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {checkoutFormData.brand ||
                        "Select Your Brand"}
                    </span>
                    <ChevronDown className="size-4 text-gray-400" />
                  </button>
                  {showBrandDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                      {brands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => {
                            handleCheckoutInputChange(
                              "brand",
                              brand,
                            );
                            setShowBrandDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Product (Product Link Only) */}
              {isProductLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Product
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowProductDropdown(
                          !showProductDropdown,
                        )
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                    >
                      <span
                        className={
                          checkoutFormData.product
                            ? "text-gray-900"
                            : "text-gray-500"
                        }
                      >
                        {checkoutFormData.product ||
                          "Select Your Product"}
                      </span>
                      <ChevronDown className="size-4 text-gray-400" />
                    </button>
                    {showProductDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                        {productsData.map((product) => (
                          <button
                            key={product}
                            onClick={() => {
                              handleCheckoutInputChange(
                                "product",
                                product,
                              );
                              setShowProductDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {product}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Price (Product Link Only) */}
              {isProductLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Product Price
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Enter the price of the product
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter amount user will pay"
                      value={checkoutFormData.productPrice}
                      onChange={(e) =>
                        handleCheckoutInputChange(
                          "productPrice",
                          e.target.value,
                        )
                      }
                      className="flex-1 px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <button className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                      Select
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Type (Simple Link Only) - Now as Dropdown */}
              {!isProductLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Payment Type
                  </label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowCheckoutPaymentTypeDropdown(
                          !showCheckoutPaymentTypeDropdown,
                        )
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                    >
                      <span className="text-gray-900">
                        {checkoutPaymentTypes.find(
                          (type) =>
                            type.value ===
                            checkoutFormData.paymentType,
                        )?.label || "Select payment type"}
                      </span>
                      <ChevronDown className="size-4 text-gray-400" />
                    </button>
                    {showCheckoutPaymentTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                        {checkoutPaymentTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              handleCheckoutInputChange(
                                "paymentType",
                                type.value as
                                  | "fixed"
                                  | "customer",
                              );
                              setShowCheckoutPaymentTypeDropdown(
                                false,
                              );
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amount (Simple Link Only, when fixed amount is selected) */}
              {!isProductLink &&
                checkoutFormData.paymentType === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Amount
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter amount user will pay"
                      value={checkoutFormData.amount}
                      onChange={(e) =>
                        handleCheckoutInputChange(
                          "amount",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                )}

              {/* Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Countries
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Only the configured payment method are shown
                </p>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCheckoutCountryDropdown(
                        !showCheckoutCountryDropdown,
                      )
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                  >
                    <span
                      className={
                        checkoutFormData.countries
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {checkoutFormData.countries ||
                        "Select Country"}
                    </span>
                    <ChevronDown className="size-4 text-gray-400" />
                  </button>
                  {showCheckoutCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 shadow-lg">
                      {countries.map((country) => (
                        <button
                          key={country}
                          onClick={() => {
                            handleCheckoutInputChange(
                              "countries",
                              country,
                            );
                            setShowCheckoutCountryDropdown(
                              false,
                            );
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Buttons */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] bg-white border-t border-gray-200 p-4 z-20">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckoutSubmit}
                disabled={!isCheckoutFormValid}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isCheckoutFormValid
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Click outside handler to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowCountryDropdown(false);
        setShowPaymentTypeDropdown(false);
        setShowFilterDropdown(false);
        setShowBrandDropdown(false);
        setShowProductDropdown(false);
        setShowCheckoutCountryDropdown(false);
        setShowCheckoutPaymentTypeDropdown(false);
        setShowVerificationActionDropdown(null);
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // Render based on current page
  if (currentPage === "products") {
    return <ProductsDashboard />;
  }

  if (currentPage === "create-product") {
    return <CreateProductForm />;
  }

  if (currentPage === "verify") {
    return <VerificationDashboard />;
  }

  if (currentPage === "checkout-links") {
    return <CheckoutLinksDashboard />;
  }

  if (
    currentPage === "create-checkout-simple" ||
    currentPage === "create-checkout-product"
  ) {
    return <CreateCheckoutLinkForm />;
  }

  if (currentPage === "dashboard") {
    return <PaymentMethodsDashboard />;
  }

  return <CreatePaymentMethodForm />;
}