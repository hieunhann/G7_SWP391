// App.js
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/LoginAndRegister/Login";
import Register from "./pages/LoginAndRegister/Register";
import MemberBookingConsultants from "./pages/BookingForm/MemberBookingConsultants";
import UserProfile from "./pages/UserProfile/UserProfile";
import Courses from "./pages/Course/Courses";
import DetailsCourse from "./pages/Course/DetailsCourse";
import BookedView from "./pages/BookingForm/BookedView";
import FeedbackCourse from "./pages/Course/FeedbackCourse";
import BlogList from "./pages/Blogs/BlogList";
import BlogDetail from "./pages/Blogs/BlogDetail";
import EditBlog from "./pages/Blogs/EditBlog";
import ViewCommunicationPrograms from "./pages/ViewCommunicationPrograms/ViewCommunicationPrograms";
import EventDetail from "./pages/ViewCommunicationPrograms/EventDetail";
import RegisteredMembers from "./pages/ViewCommunicationPrograms/RegisteredMembers";
import CRAFFT from "./pages/Surveys/CRAFFT";
import Surveys from "./pages/Surveys/Surveys";
import ASSIST from "./pages/Surveys/ASSIST";
import ScheduleManager from "./pages/ScheduleManager/ScheduleManager";
import Footer from "./components/Footer/Footer";
// import ViewCommunicationPrograms from "./pages/ViewCommunicationPrograms/ViewCommunicationPrograms";

// Router configuration
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/Surveys", element: <Surveys /> },
  { path: "/CRAFFT", element: <CRAFFT /> },
  { path: "/ASSIST", element: <ASSIST /> },
  { path: "/booking", element: <MemberBookingConsultants /> },
  { path: "/UserProfile", element: <UserProfile /> },
  { path: "/Courses", element: <Courses /> },
  { path: "/Courses/lesson/:id", element: <DetailsCourse /> },
  { path: "/booked", element: <BookedView /> },
  { path: "/Courses/lesson/:id/feedback", element: <FeedbackCourse /> },
  { path: "/blogs", element: <BlogList /> },
  { path: "/blog/:id", element: <BlogDetail /> },
  { path: "/edit-blog/:id", element: <EditBlog /> },
  { path: "/ScheduleManager", element: <ScheduleManager /> },
  { path: "/viewcommunicationprograms", element: <ViewCommunicationPrograms /> },
  { path: "/viewcommunicationprograms/:id", element: <ViewCommunicationPrograms /> },
  { path: "/viewcommunicationprograms", element: <ViewCommunicationPrograms /> },
  { path: "/event/:id", element: <EventDetail /> },
  { path: "/registered-members", element: <RegisteredMembers /> },
    // { path: "/ViewCommunicationPrograms", element: <ViewCommunicationPrograms /> },

]);

function App() {
  return (
    <GoogleOAuthProvider clientId="632195046938-srur4gsnmg8cnc7rt0hmt1gvaibdij7g.apps.googleusercontent.com">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="App">
            <RouterProvider router={router} />
            <Footer />
            <>
              <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </>
          </div>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
