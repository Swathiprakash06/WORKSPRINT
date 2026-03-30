export const navbarStyles = {
  nav: (isScrolled) => `sticky top-0 z-50 transition-all duration-300 w-full overflow-x-hidden ${
    isScrolled 
      ? 'bg-[#1F1A2E]/95 backdrop-blur-md shadow-lg' 
      : 'bg-[#1F1A2E]'
  }`,
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full',
  inner: 'flex justify-between items-center h-16 w-full',
  logo: 'text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A0AEC0] bg-clip-text text-transparent whitespace-nowrap',
  desktopNav: 'hidden md:flex items-center space-x-8',
  navLink: 'text-[#A0AEC0] hover:text-[#7C3AED] transition-colors duration-200 font-medium whitespace-nowrap',
  loginBtn: 'px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap',
  mobileMenuBtn: 'text-[#A0AEC0] hover:text-[#7C3AED] focus:outline-none',
  mobileMenu: 'md:hidden bg-[#1F1A2E] border-t border-[#7C3AED]/20 overflow-x-hidden',
  mobileMenuContainer: 'px-2 pt-2 pb-3 space-y-1',
  mobileNavLink: 'block px-3 py-2 text-[#A0AEC0] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-lg transition-colors duration-200',
  mobileLoginBtn: 'w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200'
};

export const modalStyles = {
  overlay: 'fixed inset-0 z-50 overflow-y-auto',
  backdrop: 'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity',
  container: 'flex min-h-screen items-center justify-center p-4',
  wrapper: 'relative bg-[#FAFAFE] rounded-2xl shadow-2xl max-w-2xl w-full my-8', // Increased max-w-md to max-w-2xl
  header: 'p-6 border-b border-[#7C3AED]/20',
  headerContent: 'flex justify-between items-center',
  title: 'text-2xl font-bold text-[#1F1A2E]',
  closeBtn: 'text-[#A0AEC0] hover:text-[#7C3AED] transition-colors',
  subtitle: 'text-sm text-[#A0AEC0] mt-1',
  body: 'p-6 space-y-4',
  
  // New horizontal layout styles
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4',
  inputGroupHalf: 'space-y-2',
  inputGroupFull: 'space-y-2 col-span-1 md:col-span-2',
  
  inputGroup: 'space-y-2',
  checkboxGroup: 'flex items-center justify-between mt-2',
  checkboxLabel: 'flex items-center space-x-2 cursor-pointer',
  checkbox: 'h-4 w-4 text-[#7C3AED] focus:ring-[#7C3AED] border-[#A0AEC0]/30 rounded',
  checkboxText: 'text-sm text-[#1F1A2E]',
  label: 'block text-sm font-medium text-[#1F1A2E] mb-2',
  input: 'w-full px-4 py-2 border border-[#A0AEC0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all',
  forgotPassword: 'text-sm text-[#7C3AED] hover:text-[#9B4DFF] transition-colors',
  footer: 'p-6 bg-[#F8F9FC] rounded-b-2xl flex flex-col items-center justify-center space-y-4',
  signInBtn: 'w-64 py-3 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center mx-auto',
  signUpText: 'text-center w-full',
  signUpLink: 'text-sm text-[#7C3AED] hover:text-[#9B4DFF] font-medium transition-colors',
};

export const heroStyles = {
  section: 'bg-white min-h-screen flex items-center relative overflow-hidden',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28',
  grid: 'grid md:grid-cols-2 gap-12 items-center',
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 mb-6',
  title: 'text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F1A2E] leading-tight mb-4',
  highlight: 'bg-gradient-to-r from-[#7C3AED] to-[#A0AEC0] bg-clip-text text-transparent',
  description: 'text-lg text-[#A0AEC0] mb-8 leading-relaxed',
  subtext: 'text-[#A0AEC0] mb-8',
  buttonGroup: 'flex flex-wrap gap-4 items-center',
  ctaBtn: 'px-8 py-3 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2',
  trustBadge: 'flex items-center gap-2 text-sm text-[#A0AEC0]',
  trustIcon: 'w-5 h-5 text-green-400',
  imageContainer: 'relative',
  imageWrapper: 'relative rounded-2xl overflow-hidden shadow-2xl',
  image: 'relative w-full h-auto rounded-2xl shadow-2xl',
  floatingCard: 'absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20',
  floatingCardContent: 'flex items-center gap-2',
  liveDot: 'w-2 h-2 bg-green-400 rounded-full animate-pulse',
  liveText: 'text-xs text-white'
};

export const featuresStyles = {
  section: 'py-20 bg-white',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',

  whySection: 'mb-20',
  whyContent: 'max-w-3xl mx-auto text-center',
  whyTitle: 'text-3xl md:text-4xl font-bold text-[#7C3AED] mb-6',
  whyDescription: 'text-lg text-[#A0AEC0] leading-relaxed',
  // Core Capabilities Section
  coreSection: '',
  coreTitle: 'text-3xl md:text-4xl font-bold text-[#7C3AED] mb-4',
  coreSubtitle: 'text-lg text-[#A0AEC0]',
  // Carousel
  carouselContainer: 'relative mt-16',
  swiperWrapper: 'flex transition-transform duration-500 ease-out',
  swiperSlide: 'flex-shrink-0 w-full md:w-[calc(50%-15px)] lg:w-[calc(33.333%-20px)]',
  card: 'h-full bg-[#f5f0fd] rounded-2xl p-8 flex flex-col',
  cardIcon: 'w-14 h-14 bg-[#7C3AED] text-white rounded-xl flex items-center justify-center mb-5',
  cardTitle: 'text-xl font-semibold text-[#1F1A2E] mb-4',
  cardList: 'text-sm text-[#A0AEC0] space-y-2 mt-auto',
  cardListItem: '',
  // Navigation Buttons
  navButtons: 'flex justify-end gap-3 mt-8',
  navPrev: 'w-11 h-11 rounded-full border border-[#097969] text-[#097969] hover:bg-[#097969] hover:text-white transition flex items-center justify-center cursor-pointer',
  navNext: 'w-11 h-11 rounded-full border border-[#097969] text-[#097969] hover:bg-[#097969] hover:text-white transition flex items-center justify-center cursor-pointer'
};
export const modulesStyles = {
  section: 'py-20 bg-gradient-to-b from-white to-[#F8F9FC]',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  // Header Styles
  header: 'text-center mb-16',
  title: 'text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F1A2E] mb-4',
  subtitle: 'text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto',
  // Grid Styles
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16',
  // Card Styles
  card: 'bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#7C3AED]/10',
  cardIcon: 'w-16 h-16 bg-gradient-to-br from-[#7C3AED]/10 to-[#9B4DFF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7C3AED]',
  cardTitle: 'text-base md:text-lg font-semibold text-[#1F1A2E]',
  // Pricing Note Styles
  pricingNote: 'text-center max-w-3xl mx-auto pt-8 border-t border-[#7C3AED]/20',
  pricingText: 'text-xl md:text-2xl font-bold text-[#7C3AED] mb-3',
  pricingDescription: 'text-sm md:text-base text-[#A0AEC0]'
};
export const payrollFlowStyles = {
  section: 'py-20 bg-gradient-to-b from-white to-[#F8F9FC]',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  header: 'text-center mb-16',
  headerTitle: 'text-3xl md:text-4xl font-bold text-[#1F1A2E] mb-4',
  headerSubtitle: 'text-lg md:text-xl text-[#A0AEC0] max-w-2xl mx-auto',
  // Flow Container
  flowContainer: 'relative mt-12',
  flowLine: 'absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#7C3AED]/30 via-[#7C3AED] to-[#7C3AED]/30 transform -translate-y-1/2 hidden lg:block',
  stepsGrid: 'relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6',
  // Step Card
  stepCard: 'relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-[#7C3AED]/10 hover:-translate-y-1',
  stepCardCore: 'relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-[#7C3AED] ring-2 ring-[#7C3AED]/20 hover:-translate-y-1',
  stepNumber: 'text-sm font-medium text-[#7C3AED] mb-2',
  stepTitle: 'text-lg font-semibold text-[#1F1A2E] mb-3',
  stepDescription: 'text-sm text-[#A0AEC0]',
  stepIcon: 'w-12 h-12 bg-gradient-to-br from-[#7C3AED]/10 to-[#9B4DFF]/10 rounded-xl flex items-center justify-center mb-4 text-[#7C3AED]',
  coreBadge: 'inline-block px-2 py-1 text-xs font-bold bg-[#7C3AED] text-white rounded-md mb-3',
  note: 'text-center text-sm font-medium text-[#A0AEC0] mt-8 italic',
  // Attendance Section
  attendanceSection: 'mt-12 pt-8 border-t border-[#7C3AED]/20',
  attendanceTitle: 'text-xl font-semibold text-[#1F1A2E] text-center mb-6',
  attendanceGrid: 'grid grid-cols-1 md:grid-cols-3 gap-6',
};
export const scaleStyles = {
  section: 'py-20 bg-white',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  // Layout
  grid: 'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center',
  // Left column
  leftColumn: 'space-y-8',
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 mb-4',
  title: 'text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F1A2E] leading-tight',
  highlight: 'bg-gradient-to-r from-[#7C3AED] to-[#A0AEC0] bg-clip-text text-transparent',
  description: 'text-lg text-[#A0AEC0] leading-relaxed mb-6',
  // Feature cards
  featuresGrid: 'grid gap-4',
  featureCard: 'flex gap-4 p-4 rounded-xl bg-[#F8F9FC] border border-[#7C3AED]/10 hover:border-[#7C3AED]/30 transition-all duration-300',
  featureIcon: 'flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#7C3AED]/10 to-[#9B4DFF]/10 rounded-lg flex items-center justify-center text-[#7C3AED]',
  featureContent: 'flex-1',
  featureTitle: 'font-semibold text-[#1F1A2E] mb-1',
  featureText: 'text-sm text-[#A0AEC0] leading-relaxed',
  // Right column
  rightColumn: 'relative',
  card: 'bg-gradient-to-br from-[#1F1A2E] to-[#2D2640] rounded-2xl p-8 shadow-xl border border-[#7C3AED]/20',
  cardTitle: 'text-2xl font-bold text-white mb-6',
  // Who it's for grid
  whoGrid: 'grid sm:grid-cols-2 gap-4',
  whoItem: 'p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10',
  whoItemIcon: 'w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] mb-3',
  whoItemTitle: 'font-semibold text-white mb-1',
  whoItemText: 'text-sm text-[#A0AEC0] leading-relaxed',
  // Decorative elements
  gradientOrb: 'absolute -top-20 -right-20 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none',
  gradientOrbBottom: 'absolute -bottom-20 -left-20 w-64 h-64 bg-[#9B4DFF]/20 rounded-full blur-3xl pointer-events-none',
};
export const comparisonStyles = {
  section: 'py-20 bg-gradient-to-br from-[#F8F9FC] to-white',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  // Header Section
  header: 'text-center mb-12 md:mb-16',
  badge: 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 mb-6',
  title: 'text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F1A2E] mb-4',
  titleHighlight: 'bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] bg-clip-text text-transparent',
  description: 'text-lg text-[#A0AEC0] max-w-2xl mx-auto',
  // Comparison Grid
  comparisonGrid: 'grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12',
  // HR-Pro Card
  proCard: 'bg-gradient-to-br from-[#1F1A2E] to-[#2D2640] rounded-2xl p-8 shadow-xl border border-[#7C3AED]/20 relative overflow-hidden',
  proCardGradient: 'absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-2xl',
  proBadge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white mb-4',
  proTitle: 'text-2xl md:text-3xl font-bold text-white mb-4',
  proDescription: 'text-[#A0AEC0] mb-6 leading-relaxed',
  proFeatureList: 'space-y-3',
  proFeatureItem: 'flex items-start gap-3 text-[#A0AEC0]',
  proFeatureIcon: 'w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5',
  proFeatureText: 'text-sm',
  // Traditional Tools Card
  traditionalCard: 'bg-white rounded-2xl p-8 shadow-lg border border-red-100 relative overflow-hidden',
  traditionalBadge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 mb-4',
  traditionalTitle: 'text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-4',
  traditionalDescription: 'text-[#A0AEC0] mb-6 leading-relaxed',
  traditionalFeatureList: 'space-y-3',
  traditionalFeatureItem: 'flex items-start gap-3 text-[#A0AEC0]',
  traditionalFeatureIcon: 'w-5 h-5 text-red-400 flex-shrink-0 mt-0.5',
  traditionalFeatureText: 'text-sm',
  // Highlight Section
  highlightSection: 'bg-gradient-to-r from-[#7C3AED]/5 to-[#9B4DFF]/5 rounded-2xl p-8 mb-12 border border-[#7C3AED]/20',
  highlightText: 'text-center text-[#1F1A2E] text-lg md:text-xl font-semibold mb-6',
  highlightFeature: 'flex items-center justify-center gap-2 text-[#7C3AED]',
  highlightIcon: 'w-5 h-5',
  highlightLabel: 'text-sm font-medium',
  // CTA Section
  ctaSection: 'text-center',
  ctaTitle: 'text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-3',
  ctaDescription: 'text-[#A0AEC0] mb-8',
  buttonGroup: 'flex flex-wrap gap-4 justify-center',
  primaryBtn: 'px-8 py-3 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200',
  secondaryBtn: 'px-8 py-3 border-2 border-[#7C3AED] text-[#7C3AED] font-semibold rounded-lg hover:bg-[#7C3AED] hover:text-white transition-all duration-200',
  // Footer
  footer: 'mt-12 pt-8 text-center border-t border-[#A0AEC0]/20',
  footerText: 'text-sm text-[#A0AEC0]'
};
export const footerStyles = {
  section: 'bg-[#1F1A2E] pt-16 pb-8',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  // Main Footer Grid
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12',
  // Logo Column
  logoColumn: 'space-y-4',
  logo: 'text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A0AEC0] bg-clip-text text-transparent',
  tagline: 'text-[#A0AEC0] text-sm leading-relaxed',
  // Product Column
  productColumn: 'space-y-4',
  columnTitle: 'text-white font-semibold text-lg mb-4',
  navLinks: 'space-y-2',
  navLink: 'block text-[#A0AEC0] hover:text-[#7C3AED] transition-colors duration-200 text-sm',
  // Resources Column
  resourcesColumn: 'space-y-4',
  // Newsletter Column
  newsletterColumn: 'space-y-4',
  newsletterText: 'text-[#A0AEC0] text-sm',
  subscribeForm: 'flex flex-col sm:flex-row gap-3 mt-2',
  emailInput: 'flex-1 px-4 py-2 bg-[#2D2640] border border-[#7C3AED]/20 rounded-lg text-white placeholder-[#A0AEC0] focus:outline-none focus:border-[#7C3AED] transition-colors',
  subscribeBtn: 'px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap',
  // Footer Bottom
  footerBottom: 'pt-8 border-t border-[#7C3AED]/20 text-center',
  copyright: 'text-[#A0AEC0] text-sm'
};

// Add to src/styles/styles.js

export const enquiryStyles = {
  section: 'min-h-screen bg-gradient-to-br from-[#F8F9FC] to-white py-12 px-4 sm:px-6 lg:px-8',
  container: 'max-w-4xl mx-auto',
  header: 'text-center mb-12',
  backLink: 'inline-flex items-center text-[#7C3AED] hover:text-[#9B4DFF] mb-6 transition-colors',
  title: 'text-4xl md:text-5xl font-bold text-[#1F1A2E] mb-4',
  titleHighlight: 'bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] bg-clip-text text-transparent',
  subtitle: 'text-lg text-[#A0AEC0] max-w-2xl mx-auto',
  formCard: 'max-w-4xl mx-auto',
  formWrapper: 'bg-white rounded-2xl shadow-xl border border-[#7C3AED]/10 overflow-hidden p-8 md:p-10',
  errorMessage: 'mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start',
  successMessage: 'mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start',
  
  // New horizontal layout styles
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-6',
  formGroup: 'mb-0',
  formGroupFull: 'mb-0 col-span-1 md:col-span-2',
  buttonRow: 'mt-8 flex justify-center', // Added flex and justify-center to center the button
  
  label: 'block text-sm font-medium text-[#1F1A2E] mb-2',
  input: 'w-full px-4 py-3 border border-[#A0AEC0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed',
  select: 'w-full px-4 py-3 border border-[#A0AEC0]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed',
  submitBtn: 'w-64 py-3 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center'
};
 

// export const employeeStyles = {
//   panel: 'min-h-screen bg-gray-50 flex flex-col',
//   mainContainer: 'flex flex-1 w-full',
//  contentArea: () =>
//   'flex-1 p-4 sm:p-6 lg:p-8 overflow-auto transition-all duration-300',
//   // TopBar Styles
//   topbar: {
//     container: 'sticky top-0 z-50 bg-[#1F1A2E] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-lg w-full',
//     logo: 'text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A0AEC0] bg-clip-text text-transparent whitespace-nowrap',
//     rightSection: 'flex items-center gap-2 sm:gap-4 md:gap-6',
//     userInfo: 'hidden sm:flex items-center gap-2 text-[#A0AEC0] text-xs sm:text-sm',
//     userInfoMobile: 'flex sm:hidden items-center gap-1 text-[#A0AEC0] text-xs',
//     logoutBtn: 'flex items-center gap-1 sm:gap-2 bg-[#7C3AED]/20 hover:bg-[#7C3AED] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium',
//     logoutIcon: 'w-3 h-3 sm:w-4 sm:h-4',
//     logoutText: 'hidden sm:inline',
//   },
  
//   // Sidebar Styles
//   sidebar: {
//   base: (isCollapsed, isMobileOpen) => `
//   bg-[#1F1A2E] text-white transition-all duration-300

//   fixed md:relative top-0 left-0 h-screen md:h-auto z-50

//   ${isCollapsed ? 'w-20' : 'w-64'}

//   transform md:translate-x-0
//   ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}

//   md:flex
// `,

//   overlay: 'fixed inset-0 bg-black/50 z-40 md:hidden',

//   mobileClose: 'absolute top-4 right-4 text-white md:hidden',

//   collapseBtn: 'absolute -right-3 top-8 bg-[#7C3AED] text-white p-1 rounded-full hidden md:block',

//   menu: 'py-6 h-full overflow-y-auto',

//   item: (isActive) => `
//     flex items-center gap-3 px-6 py-3 text-[#A0AEC0]
//     hover:bg-[#7C3AED]/20 hover:text-white
//     ${isActive ? 'bg-[#7C3AED] text-white border-r-4 border-[#9B4DFF]' : ''}
//   `,

//   itemCollapsed: 'justify-center px-0',
// },
  
//   // Mobile Menu (for very small screens)
//   mobileMenu: {
//     button: 'md:hidden text-[#A0AEC0] hover:text-[#7C3AED] p-2',
//     drawer: (isOpen) => `fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
//       isOpen ? 'translate-x-0' : '-translate-x-full'
//     }`,
//     overlay: 'fixed inset-0 bg-black/50 z-40 md:hidden',
//     content: 'w-full md:w-64 bg-[#1F1A2E] h-full shadow-xl',
//     header: 'p-4 border-b border-[#7C3AED]/20 flex justify-between items-center',
//     closeBtn: 'text-[#A0AEC0] hover:text-[#7C3AED]',
//     menu: 'py-4',
//     item: (isActive) => `flex items-center gap-3 px-6 py-3 text-[#A0AEC0] hover:bg-[#7C3AED]/20 hover:text-white transition-all duration-200 ${
//       isActive ? 'bg-[#7C3AED] text-white' : ''
//     }`,
//   },
  
//   // Dashboard Styles
//   dashboard: {
//     container: 'max-w-7xl mx-auto',
//     header: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8',
//     title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E]',
//     statusButtons: 'flex flex-wrap gap-11 sm:gap-3 items-center w-full sm:w-auto',
//     checkInBtn: 'flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base',
//     checkOutBtn: 'flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base',
//     statusBadge: (status) => `px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm md:text-base ${
//       status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//     }`,
//   },
  
//   // Calendar Styles
//   calendar: {
//     container: 'bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6',
//     header: 'flex justify-between items-center mb-3 sm:mb-4 md:mb-6',
//     headerBtn: 'p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors',
//     headerTitle: 'text-base sm:text-lg md:text-xl font-semibold text-[#1F1A2E]',
//     weekdays: 'grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2',
//     weekdayCell: 'text-center font-medium text-gray-500 py-1 sm:py-2 text-[10px] sm:text-xs md:text-sm',
//     days: 'grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2',
//     dayCell: (status) => `
//   h-12 sm:h-14 md:h-16
//   flex items-center justify-center
//   rounded-lg text-[10px] sm:text-xs md:text-sm
//   font-medium transition-colors
//   ${
//     status === 'present' ? 'bg-green-100 text-green-800' :
//     status === 'absent' ? 'bg-red-100 text-red-800' :
//     status === 'holiday' ? 'bg-yellow-100 text-yellow-800' :
//     'bg-transparent hover:bg-gray-100'
//   }
// `,
//     legend: 'flex justify-center gap-2 sm:gap-3 md:gap-6 mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 border-t flex-wrap',
//     legendItem: 'flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600',
//     legendColor: (color) => `w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded ${
//       color === 'present' ? 'bg-green-500' :
//       color === 'absent' ? 'bg-red-500' :
//       'bg-yellow-500'
//     }`,
//   },
  
//   // Requests/Form Styles
//   requests: {
//     container: 'max-w-2xl mx-auto px-2 sm:px-0',
//     title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-4 sm:mb-6',
//     form: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8',
//     formGroup: 'mb-4 sm:mb-5',
//     label: 'block text-sm font-medium text-gray-700 mb-1 sm:mb-2',
//     input: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all text-sm sm:text-base',
//     select: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all bg-white text-sm sm:text-base',
//     textarea: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all resize-none text-sm sm:text-base',
//     submitBtn: 'w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-sm sm:text-base',
//   },
  
// history: {
//   container: 'max-w-6xl mx-auto px-3 sm:px-4',

//   title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-4 sm:mb-6',

//   section: 'bg-white rounded-xl shadow-md p-4 sm:p-6 mb-5 sm:mb-6',

//   sectionTitle: 'text-lg sm:text-xl font-semibold text-[#1F1A2E] mb-4 border-b pb-2',

//   tableContainer: 'w-full overflow-x-auto',

//   table: 'w-full border-collapse min-w-[600px]',

//   th: `
//     text-left 
//     py-3 px-4 
//     bg-gray-50 
//     font-semibold 
//     text-gray-700 
//     text-xs sm:text-sm 
//     whitespace-nowrap
//   `,

//   td: `
//     py-3 px-4 
//     border-t 
//     border-gray-100 
//     text-xs sm:text-sm 
//     whitespace-nowrap
//   `,

//   row: 'hover:bg-gray-50 transition-colors',

//   statusCell: (status) => `
//     text-xs sm:text-sm font-medium px-2 py-1 rounded-full inline-block
//     ${
//       status === 'present' ? 'bg-green-100 text-green-700' :
//       status === 'late' ? 'bg-yellow-100 text-yellow-700' :
//       status === 'pending' ? 'bg-orange-100 text-orange-700' :
//       status === 'approved' ? 'bg-green-100 text-green-700' :
//       'bg-red-100 text-red-700'
//     }
//   `,
// },
  
//   // Loading States
//   loading: {
//     spinner: 'w-6 h-6 sm:w-8 sm:h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin',
//     overlay: 'fixed inset-0 bg-white/80 flex items-center justify-center z-50',
//     skeleton: 'animate-pulse bg-gray-200 rounded',
//   },
  
//   // Empty States
//   empty: {
//     container: 'text-center py-8 sm:py-12',
//     icon: 'w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4',
//     title: 'text-base sm:text-lg font-medium text-gray-600 mb-1 sm:mb-2',
//     description: 'text-xs sm:text-sm text-gray-400',
//   },
  
//   // Responsive Breakpoints
//   responsive: {
//     mobile: 'max-w-[640px]',
//     tablet: 'max-w-[768px]',
//     desktop: 'max-w-[1024px]',
//     wide: 'max-w-[1280px]',
//   },
  
//   // Animation Classes
//   animations: {
//     fadeIn: 'animate-fadeIn',
//     slideIn: 'animate-slideIn',
//     slideUp: 'animate-slideUp',
//     pulse: 'animate-pulse',
//     spin: 'animate-spin',
//   },
// };

// // Utility styles for employee panel
// export const employeeUtils = {
//   // Status colors
//   statusColors: {
//     present: 'bg-green-100 text-green-800 border-green-200',
//     late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//     absent: 'bg-red-100 text-red-800 border-red-200',
//     pending: 'bg-orange-100 text-orange-800 border-orange-200',
//     approved: 'bg-green-100 text-green-800 border-green-200',
//     rejected: 'bg-red-100 text-red-800 border-red-200',
//     holiday: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//   },
  
//   // Button variants
//   buttonVariants: {
//     primary: 'bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200',
//     secondary: 'border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white transition-all duration-200',
//     danger: 'bg-red-600 text-white hover:bg-red-700 transition-all duration-200',
//     success: 'bg-green-600 text-white hover:bg-green-700 transition-all duration-200',
//     warning: 'bg-yellow-500 text-white hover:bg-yellow-600 transition-all duration-200',
//   },
  
//   // Card variants
//   cardVariants: {
//     default: 'bg-white rounded-xl shadow-lg',
//     elevated: 'bg-white rounded-xl shadow-xl',
//     bordered: 'bg-white rounded-xl border border-gray-200',
//     gradient: 'bg-gradient-to-br from-[#1F1A2E] to-[#2D2640] rounded-xl shadow-xl',
//   },
  
//   // Spacing utilities
//   spacing: {
//     section: 'py-4 sm:py-6 md:py-8',
//     container: 'px-3 sm:px-4 md:px-6 lg:px-8',
//     gap: 'gap-2 sm:gap-3 md:gap-4 lg:gap-6',
//   },
  
//   // Typography
//   typography: {
//     h1: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F1A2E]',
//     h2: 'text-lg sm:text-xl md:text-2xl font-semibold text-[#1F1A2E]',
//     h3: 'text-base sm:text-lg md:text-xl font-semibold text-[#1F1A2E]',
//     body: 'text-xs sm:text-sm md:text-base text-gray-600',
//     caption: 'text-[10px] sm:text-xs md:text-sm text-gray-500',
//   },
// };

// // Add these keyframes to your tailwind.config.js
// export const keyframes = {
//   fadeIn: {
//     '0%': { opacity: '0' },
//     '100%': { opacity: '1' },
//   },
//   slideIn: {
//     '0%': { transform: 'translateX(-100%)' },
//     '100%': { transform: 'translateX(0)' },
//   },
//   slideUp: {
//     '0%': { transform: 'translateY(20px)', opacity: '0' },
//     '100%': { transform: 'translateY(0)', opacity: '1' },
//   },
// };


// styles.js
export const employeeStyles = {
  panel: 'min-h-screen bg-gray-50 flex flex-col',
  mainContainer: 'flex flex-1 w-full',
  contentArea: () =>
    'flex-1 p-4 sm:p-6 lg:p-8 overflow-auto transition-all duration-300',
  
  // TopBar Styles
  topbar: {
    container: 'sticky top-0 z-50 bg-[#1F1A2E] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-lg w-full',
    logo: 'text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#A0AEC0] bg-clip-text text-transparent whitespace-nowrap',
    rightSection: 'flex items-center gap-2 sm:gap-4 md:gap-6',
    userInfo: 'hidden sm:flex items-center gap-2 text-[#A0AEC0] text-xs sm:text-sm',
    userInfoMobile: 'flex sm:hidden items-center gap-1 text-[#A0AEC0] text-xs',
    logoutBtn: 'flex items-center gap-1 sm:gap-2 bg-[#7C3AED]/20 hover:bg-[#7C3AED] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium',
    logoutIcon: 'w-3 h-3 sm:w-4 sm:h-4',
    logoutText: 'hidden sm:inline',
  },
  
  // Sidebar Styles
  sidebar: {
    base: (isCollapsed, isMobileOpen) => `
      bg-[#1F1A2E] text-white transition-all duration-300
      fixed md:relative top-0 left-0 h-screen md:h-auto z-50
      ${isCollapsed ? 'w-20' : 'w-64'}
      transform md:translate-x-0
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:flex
    `,
    overlay: 'fixed inset-0 bg-black/50 z-40 md:hidden',
    mobileClose: 'absolute top-4 right-4 text-white md:hidden',
    collapseBtn: 'absolute -right-3 top-8 bg-[#7C3AED] text-white p-1 rounded-full hidden md:block',
    menu: 'py-6 h-full overflow-y-auto',
    item: (isActive) => `
      flex items-center gap-3 px-6 py-3 text-[#A0AEC0]
      hover:bg-[#7C3AED]/20 hover:text-white
      ${isActive ? 'bg-[#7C3AED] text-white border-r-4 border-[#9B4DFF]' : ''}
    `,
    itemCollapsed: 'justify-center px-0',
    icon: 'w-5 h-5',
  },
  
  // Mobile Menu (for very small screens)
  mobileMenu: {
    button: 'md:hidden text-[#A0AEC0] hover:text-[#7C3AED] p-2',
    drawer: (isOpen) => `fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`,
    overlay: 'fixed inset-0 bg-black/50 z-40 md:hidden',
    content: 'w-full md:w-64 bg-[#1F1A2E] h-full shadow-xl',
    header: 'p-4 border-b border-[#7C3AED]/20 flex justify-between items-center',
    closeBtn: 'text-[#A0AEC0] hover:text-[#7C3AED]',
    menu: 'py-4',
    item: (isActive) => `flex items-center gap-3 px-6 py-3 text-[#A0AEC0] hover:bg-[#7C3AED]/20 hover:text-white transition-all duration-200 ${
      isActive ? 'bg-[#7C3AED] text-white' : ''
    }`,
  },
  
  // Dashboard Styles (Employee)
  dashboard: {
    container: 'max-w-7xl mx-auto',
    header: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8',
    title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E]',
    statusButtons: 'flex flex-wrap gap-11 sm:gap-3 items-center w-full sm:w-auto',
    checkInBtn: 'flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base',
    checkOutBtn: 'flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base',
    statusBadge: (status) => `px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm md:text-base ${
      status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`,
  },
  
  // Admin Dashboard Styles (New)
  adminDashboard: {
    container: 'max-w-7xl mx-auto',
    title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-6',
    cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8',
    card: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow',
    cardHeader: 'flex items-center justify-between mb-3',
    cardIcon: 'w-8 h-8 sm:w-10 sm:h-10 text-gray-400',
    cardBadge: (color) => `px-2 py-1 rounded-full text-xs font-semibold ${color}`,
    cardValue: 'text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800',
    cardLabel: 'text-xs sm:text-sm text-gray-500 mt-2',
    absenteesSection: 'bg-white rounded-xl shadow-lg p-4 sm:p-6',
    sectionTitle: 'text-lg sm:text-xl font-semibold text-[#1F1A2E] mb-4 border-b pb-2',
    tableContainer: 'w-full overflow-x-auto',
    table: 'w-full border-collapse min-w-[500px]',
    th: 'text-left py-3 px-4 bg-gray-50 font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap',
    td: 'py-3 px-4 border-t border-gray-100 text-xs sm:text-sm whitespace-nowrap',
    statusBadge: (status) => `
      px-2 py-1 rounded-full text-xs font-medium inline-block
      ${status === 'present' ? 'bg-green-100 text-green-700' : 
        status === 'late' ? 'bg-yellow-100 text-yellow-700' : 
        'bg-red-100 text-red-700'}
    `,
  },
  
  // Calendar Styles
  calendar: {
    container: 'bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6',
    header: 'flex justify-between items-center mb-3 sm:mb-4 md:mb-6',
    headerBtn: 'p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors',
    headerTitle: 'text-base sm:text-lg md:text-xl font-semibold text-[#1F1A2E]',
    weekdays: 'grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2',
    weekdayCell: 'text-center font-medium text-gray-500 py-1 sm:py-2 text-[10px] sm:text-xs md:text-sm',
    days: 'grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2',
    dayCell: (status) => `
      h-12 sm:h-14 md:h-16
      flex items-center justify-center
      rounded-lg text-[10px] sm:text-xs md:text-sm
      font-medium transition-colors
      ${
        status === 'present' ? 'bg-green-100 text-green-800' :
        status === 'absent' ? 'bg-red-100 text-red-800' :
        status === 'holiday' ? 'bg-yellow-100 text-yellow-800' :
        'bg-transparent hover:bg-gray-100'
      }
    `,
    legend: 'flex justify-center gap-2 sm:gap-3 md:gap-6 mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 border-t flex-wrap',
    legendItem: 'flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600',
    legendColor: (color) => `w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded ${
      color === 'present' ? 'bg-green-500' :
      color === 'absent' ? 'bg-red-500' :
      'bg-yellow-500'
    }`,
  },
  
  // Requests/Form Styles (Shared)
  requests: {
    container: 'max-w-2xl mx-auto px-2 sm:px-0',
    title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-4 sm:mb-6',
    form: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8',
    formGroup: 'mb-4 sm:mb-5',
    label: 'block text-sm font-medium text-gray-700 mb-1 sm:mb-2',
    input: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all text-sm sm:text-base',
    select: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all bg-white text-sm sm:text-base',
    textarea: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all resize-none text-sm sm:text-base',
    submitBtn: 'w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-sm sm:text-base',
    actionButtons: 'flex gap-2',
    editBtn: 'p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors',
    deleteBtn: 'p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors',
    deactivateBtn: 'p-1.5 sm:p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors',
    approveBtn: 'p-1.5 sm:p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors',
    rejectBtn: 'p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors',
  },
  
  // Table Styles (Admin)
  table: {
    container: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden',
    header: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6',
    title: 'text-lg sm:text-xl font-semibold text-[#1F1A2E]',
    searchBox: 'flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200',
    searchInput: 'bg-transparent outline-none text-sm w-40 sm:w-60',
    tableWrapper: 'w-full overflow-x-auto',
    table: 'w-full border-collapse min-w-[600px]',
    th: 'text-left py-3 px-4 bg-gray-50 font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap',
    td: 'py-3 px-4 border-t border-gray-100 text-xs sm:text-sm whitespace-nowrap',
    statusBadge: (status) => `
      px-2 py-1 rounded-full text-xs font-medium inline-block
      ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
    `,
  },
  
  // History Page Styles (Admin)
  history: {
    container: 'max-w-6xl mx-auto px-3 sm:px-4',
    title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-4 sm:mb-6',
    section: 'bg-white rounded-xl shadow-md p-4 sm:p-6 mb-5 sm:mb-6',
    sectionTitle: 'text-lg sm:text-xl font-semibold text-[#1F1A2E] mb-4 border-b pb-2',
    tableContainer: 'w-full overflow-x-auto',
    table: 'w-full border-collapse min-w-[600px]',
    th: 'text-left py-3 px-4 bg-gray-50 font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap',
    td: 'py-3 px-4 border-t border-gray-100 text-xs sm:text-sm whitespace-nowrap',
    row: 'hover:bg-gray-50 transition-colors',
    statusCell: (status) => `
      text-xs sm:text-sm font-medium px-2 py-1 rounded-full inline-block
      ${
        status === 'present' ? 'bg-green-100 text-green-700' :
        status === 'late' ? 'bg-yellow-100 text-yellow-700' :
        status === 'pending' ? 'bg-orange-100 text-orange-700' :
        status === 'approved' ? 'bg-green-100 text-green-700' :
        'bg-red-100 text-red-700'
      }
    `,
  },
  
  // Location Restriction Page Styles (Admin)
  location: {
    container: 'max-w-2xl mx-auto px-2 sm:px-0',
    title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-4 sm:mb-6',
    card: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8',
    formGroup: 'mb-4 sm:mb-5',
    label: 'block text-sm font-medium text-gray-700 mb-1 sm:mb-2',
    input: 'w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all text-sm sm:text-base',
    infoBox: 'mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200',
    infoText: 'text-sm text-blue-800',
  },
  
  // Employee List Sidebar Styles (Admin History)
  employeeSidebar: {
    container: 'bg-white rounded-xl shadow-lg p-4 h-fit',
    searchBox: 'mb-4 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200',
    searchInput: 'bg-transparent outline-none text-sm flex-1',
    list: 'space-y-2 max-h-[400px] overflow-y-auto',
    item: (isActive) => `
      w-full text-left p-3 rounded-lg transition-all
      ${isActive ? 'bg-[#7C3AED] text-white' : 'hover:bg-gray-100'}
    `,
    avatar: (isActive) => `
      w-8 h-8 rounded-full flex items-center justify-center
      ${isActive ? 'bg-white/20' : 'bg-gray-200'}
    `,
    name: 'font-medium text-sm',
    role: 'text-xs opacity-75',
  },
  
  // Employee Detail Card Styles
  employeeDetail: {
    card: 'bg-white rounded-xl shadow-lg p-6 mb-6',
    name: 'text-xl font-bold text-[#1F1A2E] mb-2',
    email: 'text-gray-600 text-sm',
    phone: 'text-gray-600 text-sm',
    tags: 'flex gap-2 mt-3',
    tag: 'px-2 py-1 bg-gray-100 rounded-full text-xs',
  },
  
  // Loading States
  loading: {
    spinner: 'w-6 h-6 sm:w-8 sm:h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin',
    overlay: 'fixed inset-0 bg-white/80 flex items-center justify-center z-50',
    skeleton: 'animate-pulse bg-gray-200 rounded',
  },
  
  // Empty States
  empty: {
    container: 'text-center py-8 sm:py-12',
    icon: 'w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4',
    title: 'text-base sm:text-lg font-medium text-gray-600 mb-1 sm:mb-2',
    description: 'text-xs sm:text-sm text-gray-400',
  },
  
  // Responsive Breakpoints
  responsive: {
    mobile: 'max-w-[640px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-[1024px]',
    wide: 'max-w-[1280px]',
  },
  
  // Animation Classes
  animations: {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    slideUp: 'animate-slideUp',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },
  // Add to your employeeStyles object in styles.js

// Super Admin Dashboard Styles
superAdminDashboard: {
  container: 'max-w-7xl mx-auto',
  title: 'text-xl sm:text-2xl md:text-3xl font-bold text-[#1F1A2E] mb-6',
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8',
  card: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow cursor-pointer',
  cardHeader: 'flex items-center justify-between mb-3',
  cardIcon: 'w-8 h-8 sm:w-10 sm:h-10 text-gray-400',
  cardBadge: (color) => `px-2 py-1 rounded-full text-xs font-semibold ${color}`,
  cardValue: 'text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800',
  cardLabel: 'text-xs sm:text-sm text-gray-500 mt-2',
  recentSection: 'bg-white rounded-xl shadow-lg p-4 sm:p-6',
  sectionTitle: 'text-lg sm:text-xl font-semibold text-[#1F1A2E] mb-4 border-b pb-2',
  tableContainer: 'w-full overflow-x-auto',
  table: 'w-full border-collapse min-w-[500px]',
  th: 'text-left py-3 px-4 bg-gray-50 font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap',
  td: 'py-3 px-4 border-t border-gray-100 text-xs sm:text-sm whitespace-nowrap',
  statusBadge: (status) => `
    px-2 py-1 rounded-full text-xs font-medium inline-block
    ${status === 'accepted' ? 'bg-green-100 text-green-700' : 
      status === 'rejected' ? 'bg-red-100 text-red-700' : 
      'bg-yellow-100 text-yellow-700'}
  `,
},

// Super Admin Enquiry Management
superAdminEnquiry: {
  container: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden',
  header: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6',
  title: 'text-lg sm:text-xl font-semibold text-[#1F1A2E]',
  searchBox: 'flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200',
  searchInput: 'bg-transparent outline-none text-sm w-40 sm:w-60',
  filterGroup: 'flex gap-2',
  filterBtn: (active) => `
    px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all
    ${active ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
  `,
  tableWrapper: 'w-full overflow-x-auto',
  table: 'w-full border-collapse min-w-[800px]',
  th: 'text-left py-3 px-4 bg-gray-50 font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap',
  td: 'py-3 px-4 border-t border-gray-100 text-xs sm:text-sm whitespace-nowrap',
  actionButtons: 'flex gap-2',
  acceptBtn: 'p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors',
  rejectBtn: 'p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors',
  viewBtn: 'p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors',
  statusBadge: (status) => `
    px-2 py-1 rounded-full text-xs font-medium inline-block
    ${status === 'accepted' ? 'bg-green-100 text-green-700' : 
      status === 'rejected' ? 'bg-red-100 text-red-700' : 
      'bg-yellow-100 text-yellow-700'}
  `,
},

// Super Admin Organization List
superAdminOrg: {
  container: 'bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden',
  header: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6',
  title: 'text-lg sm:text-xl font-semibold text-[#1F1A2E]',
  searchBox: 'flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200',
  searchInput: 'bg-transparent outline-none text-sm w-40 sm:w-60',
  tableWrapper: 'w-full overflow-x-auto',
  table: 'w-full border-collapse min-w-[700px]',
  th: 'text-left py-3 px-4 bg-gray-50 font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap',
  td: 'py-3 px-4 border-t border-gray-100 text-xs sm:text-sm whitespace-nowrap',
  statusBadge: (status) => `
    px-2 py-1 rounded-full text-xs font-medium inline-block
    ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
  `,
  limitBadge: (used, limit) => `
    px-2 py-1 rounded-full text-xs font-medium inline-block
    ${used >= limit ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
  `,
  actions: 'flex gap-2',
  editBtn: 'p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors',
  suspendBtn: 'p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors',
},
};

// Utility styles for employee panel
export const employeeUtils = {
  // Status colors
  statusColors: {
    present: 'bg-green-100 text-green-800 border-green-200',
    late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    absent: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-orange-100 text-orange-800 border-orange-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    holiday: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-red-100 text-red-800 border-red-200',
  },
  
  // Button variants
  buttonVariants: {
    primary: 'bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200',
    secondary: 'border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white transition-all duration-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 transition-all duration-200',
    success: 'bg-green-600 text-white hover:bg-green-700 transition-all duration-200',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 transition-all duration-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200',
  },
  
  // Card variants
  cardVariants: {
    default: 'bg-white rounded-xl shadow-lg',
    elevated: 'bg-white rounded-xl shadow-xl',
    bordered: 'bg-white rounded-xl border border-gray-200',
    gradient: 'bg-gradient-to-br from-[#1F1A2E] to-[#2D2640] rounded-xl shadow-xl',
  },
  
  // Spacing utilities
  spacing: {
    section: 'py-4 sm:py-6 md:py-8',
    container: 'px-3 sm:px-4 md:px-6 lg:px-8',
    gap: 'gap-2 sm:gap-3 md:gap-4 lg:gap-6',
  },
  
  // Typography
  typography: {
    h1: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1F1A2E]',
    h2: 'text-lg sm:text-xl md:text-2xl font-semibold text-[#1F1A2E]',
    h3: 'text-base sm:text-lg md:text-xl font-semibold text-[#1F1A2E]',
    body: 'text-xs sm:text-sm md:text-base text-gray-600',
    caption: 'text-[10px] sm:text-xs md:text-sm text-gray-500',
  },
  
  // Flex and Grid utilities
  layout: {
    flexBetween: 'flex justify-between items-center',
    flexCenter: 'flex justify-center items-center',
    flexCol: 'flex flex-col',
    gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
    gridCols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  },
};

// Keyframes for animations (add to tailwind.config.js)
export const keyframes = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideIn: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0)' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
};