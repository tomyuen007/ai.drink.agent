import { Platform } from "react-native";

// Styling engine per platform:
//   web     → Tailwind CSS (NativeWind emits a real .css stylesheet)
//   iOS/Android → NativeWind (babel transform converts className to RN StyleSheet)
//
// Responsive breakpoints (Tailwind defaults, evaluated against window width):
//   default < 640px  — phone portrait
//   sm:     ≥ 640px  — phone landscape / tablet / small browser
//   md:     ≥ 768px  — tablet landscape / medium browser
//   lg:     ≥ 1024px — desktop browser

const isWeb = Platform.OS === "web";

export const S = {
  // ── Layout ────────────────────────────────────────────────────────────────
  container: "flex-1 bg-sky-100",
  // Center content on wide screens; full width on phone
  scroll:          "px-5 pt-10 pb-10 sm:px-8 sm:pt-14 items-center",
  contentWrapper:  "w-full max-w-lg",

  // ── Header ────────────────────────────────────────────────────────────────
  header:   "items-center mb-5 sm:mb-7",
  title:    "text-2xl font-bold text-sky-700 sm:text-[28px] md:text-[32px]",
  subtitle: "text-xs text-slate-500 mt-1 sm:text-[13px]",

  // ── Form ──────────────────────────────────────────────────────────────────
  label: "text-[13px] font-semibold text-gray-700 mb-1.5",
  input: isWeb
    ? "bg-white rounded-xl border-[1.5px] border-gray-300 px-3.5 py-[11px] text-[15px] text-gray-900 mb-4 focus:border-sky-400 focus:outline-none"
    : "bg-white rounded-xl border-[1.5px] border-gray-300 px-3.5 py-[11px] text-[15px] text-gray-900 mb-4",

  // ── Quick questions dropdown ──────────────────────────────────────────────
  pickerLabel:     "text-[13px] font-semibold text-gray-700 mb-1.5",
  pickerContainer: "bg-white rounded-xl border-[1.5px] border-gray-300 mb-4 overflow-hidden justify-center",

  // ── Button ────────────────────────────────────────────────────────────────
  button: isWeb
    ? "bg-sky-500 rounded-xl py-3.5 items-center mb-5 hover:bg-sky-600 active:opacity-80 cursor-pointer"
    : "bg-sky-500 rounded-xl py-3.5 items-center mb-5",
  buttonDisabled: "opacity-60",
  buttonText:     "text-white text-base font-semibold",
  outlineButton: isWeb
    ? "border-[1.5px] border-sky-400 rounded-xl py-3.5 items-center mb-3 hover:bg-sky-50 active:opacity-70 cursor-pointer"
    : "border-[1.5px] border-sky-400 rounded-xl py-3.5 items-center mb-3",
  outlineButtonText: "text-sky-600 text-base font-semibold",

  // ── Answer box ────────────────────────────────────────────────────────────
  answerBox:      "bg-green-50 border-[1.5px] border-green-300 rounded-xl p-4 mb-4",
  answerCity:     "text-[11px] font-bold text-green-600 uppercase tracking-[1px]",
  answerQuestion: "text-[13px] text-gray-600 italic my-1.5",
  answerText:     "text-[15px] text-gray-900 leading-[23px] sm:text-base sm:leading-relaxed",

  // ── Error box ─────────────────────────────────────────────────────────────
  errorBox:  "bg-red-50 border-[1.5px] border-red-300 rounded-xl p-3.5 mb-4",
  errorText: "text-red-700 text-[13px]",

  // ── Interactive group box ─────────────────────────────────────────────────
  groupBox:         "border-[1.5px] border-gray-300 rounded-xl px-4 pt-5 pb-4 mt-2 relative",
  groupCaption:     "absolute -top-[10px] left-3 bg-sky-100 px-1.5",
  groupCaptionText: "text-[11px] text-slate-500 font-semibold",
  // flex-wrap on phone so badges don't overflow; single row on sm+
  badgeRow:         "flex-row flex-wrap gap-1.5 sm:flex-nowrap",
  badge: isWeb
    ? "bg-white border-[1.5px] border-violet-300 rounded-lg py-2 items-center flex-1 min-w-[56px] hover:bg-violet-50 active:opacity-70 cursor-pointer"
    : "bg-white border-[1.5px] border-violet-300 rounded-lg py-2 items-center flex-1 min-w-[56px]",
  badgeText: "text-[11px] text-violet-700 font-semibold",
  historyBadge: isWeb
    ? "bg-white border-[1.5px] border-sky-400 rounded-lg py-2 items-center flex-1 min-w-[56px] hover:bg-sky-50 active:opacity-70 cursor-pointer"
    : "bg-white border-[1.5px] border-sky-400 rounded-lg py-2 items-center flex-1 min-w-[56px]",
  historyBadgeText: "text-[11px] text-sky-600 font-semibold",

  // ── Modals — bottom sheet on phone, centered dialog on sm+ ───────────────
  modalOverlay: "flex-1 bg-black/40 justify-end sm:justify-center sm:items-center sm:px-4",
  modalSheet:   "bg-white rounded-t-2xl px-6 pt-5 pb-8 sm:rounded-2xl sm:max-w-md sm:w-full sm:mx-auto",
  modalTitle:   "text-base font-bold text-gray-900 mb-2 sm:text-lg",
  modalBody:    "text-[13px] text-gray-600 leading-[21px] sm:text-sm sm:leading-relaxed",
  modalClose: isWeb
    ? "mt-5 bg-sky-500 rounded-xl py-3 items-center hover:bg-sky-600 cursor-pointer"
    : "mt-5 bg-sky-500 rounded-xl py-3 items-center",
  modalCloseText: "text-white text-[14px] font-semibold",

  // ── Page header (shared by all pages) ────────────────────────────────────
  pageHeader:       "flex-row items-center bg-sky-100 px-4 pt-12 pb-3 border-b border-sky-200",
  pageHeaderTitle:  "flex-1 text-center text-lg font-bold text-sky-700",
  pageHeaderSpacer: "w-10",

  // ── Main / home page ──────────────────────────────────────────────────────
  mainBody:       "flex-1 items-center justify-center px-8",
  mainWelcome:    "text-3xl font-bold text-sky-700 mb-3 sm:text-4xl",
  mainTagline:    "text-sm text-slate-500 text-center mb-10 leading-relaxed",
  mainCTA: isWeb
    ? "bg-sky-500 rounded-2xl px-10 py-4 items-center hover:bg-sky-600 cursor-pointer"
    : "bg-sky-500 rounded-2xl px-10 py-4 items-center",
  mainCTAText:    "text-white text-base font-semibold",

  // ── Menu ──────────────────────────────────────────────────────────────────
  menuButton:      "w-10 h-10 items-center justify-center",
  menuIcon:        "text-2xl text-sky-700",
  menuOverlay:     "flex-1 flex-row bg-black/40",
  menuDrawer:      "bg-white w-64 pt-14 px-5 shadow-2xl relative",
  menuHeading:     "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4",
  menuCloseBtn:    "absolute top-4 right-4 w-9 h-9 items-center justify-center",
  menuCloseBtnText:"text-xl text-gray-400",
  menuItem: isWeb
    ? "py-3.5 border-b border-gray-100 hover:bg-sky-50 cursor-pointer"
    : "py-3.5 border-b border-gray-100",
  menuItemText:    "text-[15px] text-gray-800 font-medium",

  // ── History modal ─────────────────────────────────────────────────────────
  historyItem:     "border-b border-gray-100 pb-3 mb-3",
  historyCity:     "text-[11px] font-bold text-green-600 uppercase tracking-[1px]",
  historyQuestion: "text-[13px] text-gray-600 italic mt-0.5",
  historyAnswer:   "text-[13px] text-gray-900 mt-1 leading-[20px]",
  historyEmpty:    "text-[13px] text-slate-400 text-center py-8",

  // ── Settings page ─────────────────────────────────────────────────────────
  settingsScroll:        "px-5 pt-6 pb-10 sm:px-8 items-center",
  settingsSection:       "w-full max-w-lg bg-white rounded-2xl px-5 mb-5 shadow-sm",
  settingsSectionTitle:  "text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-4 pb-2",
  settingsRow:           "flex-row items-center justify-between py-4 border-b border-gray-100",
  settingsRowLast:       "flex-row items-center justify-between py-4",
  settingsLabel:         "text-[15px] text-gray-800 font-medium flex-1",
  settingsHint:          "text-[12px] text-slate-400 mt-0.5",

  // ── Chatbot (Home page) ───────────────────────────────────────────────────
  chatContainer:    "flex-1 bg-sky-50",
  chatMessages:     "flex-1",
  chatMsgList:      "px-4 pt-4 pb-2",
  chatBubbleUser:   "self-end bg-sky-500 rounded-2xl rounded-tr-sm px-4 py-3 mb-3 max-w-[80%]",
  chatBubbleBot:    "self-start bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 mb-3 max-w-[80%] shadow-sm",
  chatBubbleErr:    "self-start bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 mb-3 max-w-[80%]",
  chatTextUser:     "text-white text-[15px] leading-relaxed",
  chatTextBot:      "text-gray-900 text-[15px] leading-relaxed",
  chatTextErr:      "text-red-700 text-[15px] leading-relaxed",
  chatInputRow:     "flex-row items-end px-3 py-3 bg-white border-t border-gray-200",
  chatInput: isWeb
    ? "flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-[15px] text-gray-900 mr-2 max-h-32 focus:outline-none"
    : "flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-[15px] text-gray-900 mr-2 max-h-32",
  chatSend: isWeb
    ? "w-11 h-11 bg-sky-500 rounded-full items-center justify-center hover:bg-sky-600 cursor-pointer"
    : "w-11 h-11 bg-sky-500 rounded-full items-center justify-center",
  chatSendDisabled: "w-11 h-11 bg-gray-300 rounded-full items-center justify-center",

  // ── Auth pages (Login / Sign-up / Logout) ────────────────────────────────
  authBody:     "flex-1 items-center justify-center px-6 py-10 bg-sky-100",
  authCard:     "w-full max-w-sm bg-white rounded-2xl p-7 shadow-md",
  authTitle:    "text-2xl font-bold text-sky-700 mb-1",
  authSubtitle: "text-sm text-slate-500 mb-6",
  linkButton: isWeb
    ? "items-center py-2 mt-2 cursor-pointer"
    : "items-center py-2 mt-2",
  linkButtonText: isWeb
    ? "text-sky-600 text-[14px] font-medium underline"
    : "text-sky-600 text-[14px] font-medium",
  userInfoBox:   "bg-sky-50 border-[1.5px] border-sky-200 rounded-xl p-4 mb-5",
  userInfoLabel: "text-[11px] font-bold text-sky-600 uppercase tracking-[1px] mb-0.5",
  userInfoValue: "text-[15px] text-gray-900",
  logoutButton: isWeb
    ? "bg-red-500 rounded-xl py-3.5 items-center mb-3 hover:bg-red-600 active:opacity-80 cursor-pointer"
    : "bg-red-500 rounded-xl py-3.5 items-center mb-3",
  logoutButtonText: "text-white text-base font-semibold",
};
