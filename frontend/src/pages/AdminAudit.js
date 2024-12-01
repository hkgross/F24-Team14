import Navbar from "../layout/Navbar";
import AdminNav from "../layout/AdminNav";
import AdminAuditLog from "../components/AdminAuditLog";

const AdminAudit = () => {
    return (
        <>
            <Navbar />
            <AdminNav />
            <AdminAuditLog />
        </>
    )
}

export default AdminAudit;