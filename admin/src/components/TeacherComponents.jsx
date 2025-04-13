import gradeOptions from "../utils/gradeOptions";

export const ProfileHeader = ({ teacherInfo }) => {
  const formatName = (teacher) => {
    const middleInitial = teacher.middleName ? `${teacher.middleName.charAt(0)}.` : "";
    return `${teacher.firstName} ${middleInitial} ${teacher.lastName}`;
  };

  return (
      <div className="bg-gradient-to-r from-customRed to-navbar p-8 text-white flex items-center">
      {teacherInfo?.image && (
        <img
          src={teacherInfo.image}
          alt="Teacher"
          className="w-32 h-32 rounded-full border-4 border-white shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = teacherInfo.image; // Use user image as fallback
          }}
        />
      )}
      <div className="ml-6">
        <h2 className="text-3xl font-bold">{teacherInfo ? formatName(teacherInfo) : "Loading..."}</h2>
        <p className="text-lg opacity-80">{teacherInfo.email}</p>
      </div>
    </div>
  );
};

export const ProfileForm = ({ formData, setFormData, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-6 bg-white rounded-lg shadow-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          id="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="middleName">
          Middle Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          id="middleName"
          type="text"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number">
          Contact Number
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          id="number"
          type="text"
          placeholder="Contact Number"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          id="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          id="address"
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
    </div>
    <div className="flex items-center justify-end mt-6">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

export const SuccessModal = ({ isOpen, onClose }) => (
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Profile Updated Successfully!</h2>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  )
);

export const TeachingAssignmentsList = ({ assignments, onRemove }) => (
  <div>
    <h4 className="text-lg font-medium mt-6 mb-2">Current Teaching Assignments</h4>
    {assignments.length > 0 ? (
      <ul className="list-disc list-inside">
        {assignments.map((assignment, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{`${assignment.educationLevel} - Grade ${assignment.gradeYearLevel} - Section ${assignment.section}`}</span>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => onRemove(assignment)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No teaching assignments added yet.</p>
    )}
  </div>
);

export const EducationalSelections = ({
  educationLevel,
  setEducationLevel,
  gradeYearLevel,
  setGradeYearLevel,
  section,
  setSection,
  availableSections,
  educationLevels,
  onSubmit,
  teachingAssignments,
}) => {
  const isAssignmentSelected = (edLevel, grLevel, sec) => {
    return teachingAssignments.some(
      (assignment) =>
        assignment.educationLevel === edLevel &&
        assignment.gradeYearLevel === grLevel &&
        assignment.section === sec
    );
  };

  return (
    <div className="mt-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="educationLevel">
          Education Level
        </label>
        <select
          id="educationLevel"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
          value={educationLevel}
          onChange={(e) => {
            setEducationLevel(e.target.value);
            setGradeYearLevel("");
            setSection("");
          }}
        >
          <option value="">Select Education Level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      {educationLevel && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gradeYearLevel">
            Grade/Year Level
          </label>
          <select
            id="gradeYearLevel"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
            value={gradeYearLevel}
            onChange={(e) => {
              setGradeYearLevel(e.target.value);
              setSection("");
            }}
          >
            <option value="">Select Grade/Year Level</option>
            {gradeOptions[educationLevel] &&
              Object.keys(gradeOptions[educationLevel]).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
          </select>
        </div>
      )}
      {gradeYearLevel && (
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="section">
            Section
          </label>
          <select
            id="section"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">Select Section</option>
            {availableSections.map((sec, index) => (
              <option
                key={index}
                value={sec}
                disabled={isAssignmentSelected(educationLevel, gradeYearLevel, sec)}
              >
                {sec}
                {isAssignmentSelected(educationLevel, gradeYearLevel, sec) ? " (Already Assigned)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      {section && (
        <div className="mt-4">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300"
            onClick={onSubmit}
          >
            Add Teaching Assignment
          </button>
        </div>
      )}
    </div>
  );
};

export const ItemListSection = ({
  title,
  items,
  newItemValue,
  setNewItemValue,
  handleAddItem,
  handleRemoveItem,
  handleEditItem,
  editingItemId,
  setEditingItemId,
  editedItemValue,
  setEditedItemValue,
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <ul className="list-disc list-inside mb-4">
      {items.map((item, index) => (
        <li key={index} className="flex justify-between items-center mb-2">
          {editingItemId === index ? (
            <input
              type="text"
              value={editedItemValue}
              onChange={(e) => setEditedItemValue(e.target.value)}
              className="border rounded px-2 py-1 mr-2 w-full"
            />
          ) : (
            <span>{item}</span>
          )}
          <div className="flex space-x-2">
            {editingItemId === index ? (
              <button
                onClick={() => handleEditItem(index)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditingItemId(index)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => handleRemoveItem(index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
    <div className="flex">
      <input
        type="text"
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
        className="border rounded px-2 py-1 flex-grow mr-2"
        placeholder={`Add new ${title.toLowerCase()}`}
      />
      <button
        onClick={handleAddItem}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
      >
        Add
      </button>
    </div>
  </div>
);