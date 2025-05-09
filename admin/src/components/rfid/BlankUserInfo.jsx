import { motion } from "framer-motion";
import { UserCircle2 } from "lucide-react";

 const BlankUserInfo = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-slate-400 p-4"
        >
            <UserCircle2 className="w-24 h-24 mb-4 text-slate-300" />
        </motion.div>
    );
}

export default BlankUserInfo;