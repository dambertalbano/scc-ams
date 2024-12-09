const addAdministrator = async (req, res) => { try { const { code, name, email, password, number, position, address } = req.body; const imageFile = req.file;

        if (!name || !email || !password || !number || !position || !address || !code) {
            return res.json({ success: false, message: "Missing Details" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const administratorData = {
            code,
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            number,
            position,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newAdministrator = new administratorModel(administratorData);
        await newAdministrator.save();
        res.json({ success: true, message: 'Administrator Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}
