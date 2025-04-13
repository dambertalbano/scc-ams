import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { AddStudentCard, AddTeachersCard } from '../../components/UserCard';

const AddUsers = () => {
    useEffect(() => {
        document.title = 'Add User';
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6">
            <motion.div
                initial="initial"
                animate="animate"
                transition={{ staggerChildren: 0.1 }}
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 place-items-center"
            >
                <motion.div variants={cardAnimation}>
                    <AddStudentCard />
                </motion.div>

                <motion.div variants={cardAnimation}>
                    <AddTeachersCard />
                </motion.div>

            </motion.div>
        </div>
    );
};

const cardAnimation = {
    initial: { scale: 0.5, y: 50, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    transition: { type: "spring", mass: 3, stiffness: 400, damping: 50 },
};

export default AddUsers;