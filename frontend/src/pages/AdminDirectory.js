import Navbar from "../layout/Navbar";
import AdminNav from "../layout/AdminNav";
import AdminDirectoryContent from "../components/AdminDirectoryContent";

export default function AdminDirectory () {
    return (
        <>
            <Navbar />
            <AdminNav />
            <AdminDirectoryContent />
        </>
    )
}