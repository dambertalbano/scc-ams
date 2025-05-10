import gradeOptions from "../utils/gradeOptions";

export const ProfileHeader = ({ teacherInfo }) => {
  const formatName = (teacher) => {
    if (!teacher) return "Loading...";
    const middleInitial = teacher.middleName ? `${teacher.middleName.charAt(0)}.` : "";
    return `${teacher.firstName || ''} ${middleInitial} ${teacher.lastName || ''}`.trim();
  };

  return (
    <div className="bg-gradient-to-r from-customRed to-navbar p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 rounded-t-xl">
      {teacherInfo?.image && (
        <img
          src={teacherInfo.image}
          alt="Teacher"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-slate-300 object-cover shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150";
          }}
        />
      )}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold">{teacherInfo ? formatName(teacherInfo) : "Loading..."}</h2>
        <p className="text-md sm:text-lg opacity-90">{teacherInfo?.email || 'No email provided'}</p>
      </div>
    </div>
  );
};

export const ProfileForm = ({ formData, setFormData, onSubmit }) => (
  <form onSubmit={onSubmit} className="p-4 sm:p-6 bg-slate-800 rounded-b-xl">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="firstName">
          First Name
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500 cursor-not-allowed"
          id="firstName"
          type="text"
          placeholder="First Name"
          value={formData.firstName || ''}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500 cursor-not-allowed"
          id="lastName"
          type="text"
          placeholder="Last Name"
          value={formData.lastName || ''}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="middleName">
          Middle Name
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500 cursor-not-allowed"
          id="middleName"
          type="text"
          placeholder="Middle Name"
          value={formData.middleName || ''}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500 cursor-not-allowed"
          id="email"
          type="email"
          placeholder="Email"
          value={formData.email || ''}
          readOnly
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="number">
          Contact Number
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="number"
          type="text"
          placeholder="Contact Number"
          value={formData.number || ''}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="address">
          Address
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          id="address"
          type="text"
          placeholder="Address"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="code">
          Teacher Code
        </label>
        <input
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500 cursor-not-allowed"
          id="code"
          type="text"
          placeholder="Teacher Code"
          value={formData.code || ''}
          readOnly
        />
      </div>
    </div>
    <div className="flex items-center justify-end mt-6">
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        type="submit"
      >
        Update Profile
      </button>
    </div>
  </form>
);

export const SuccessModal = ({ isOpen, onClose }) => (
  isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-700 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-md font-bold mb-4 text-gray-200">Profile Updated Successfully!</h2>
        <button
          className="bg-red-600 hover:bg-red-700 text-sm text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  )
);

export const TeachingAssignmentsList = ({ assignments, onRemove }) => (
  <div className="text-gray-300">
    <h4 className="text-lg font-medium mt-6 mb-2 text-gray-200">Current Teaching Assignments</h4>
    {assignments.length > 0 ? (
      <ul className="list-disc list-inside space-y-2">
        {assignments.map((assignment, index) => (
          <li key={index} className="flex justify-between items-center p-2 bg-slate-700 rounded">
            <span className="text-gray-300">{`${assignment.educationLevel} - Grade ${assignment.gradeYearLevel} - Section ${assignment.section}`}</span>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
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
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="educationLevel">
          Education Level
        </label>
        <select
          id="educationLevel"
          className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
          value={educationLevel}
          onChange={(e) => {
            setEducationLevel(e.target.value);
            setGradeYearLevel("");
            setSection("");
          }}
        >
          <option value="" className="bg-slate-700 text-gray-300">Select Education Level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level} className="bg-slate-700 text-gray-300">
              {level}
            </option>
          ))}
        </select>
      </div>
      {educationLevel && (
        <div>
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="gradeYearLevel">
            Grade/Year Level
          </label>
          <select
            id="gradeYearLevel"
            className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
            value={gradeYearLevel}
            onChange={(e) => {
              setGradeYearLevel(e.target.value);
              setSection("");
            }}
          >
            <option value="" className="bg-slate-700 text-gray-300">Select Grade/Year Level</option>
            {gradeOptions[educationLevel] &&
              Object.keys(gradeOptions[educationLevel]).map((level) => (
                <option key={level} value={level} className="bg-slate-700 text-gray-300">
                  {level}
                </option>
              ))}
          </select>
        </div>
      )}
      {gradeYearLevel && (
        <div>
          <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="section">
            Section
          </label>
          <select
            id="section"
            className="shadow appearance-none border border-slate-600 bg-slate-700 rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:border-red-500"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="" className="bg-slate-700 text-gray-300">Select Section</option>
            {availableSections.map((sec, index) => (
              <option
                key={index}
                value={sec}
                disabled={isAssignmentSelected(educationLevel, gradeYearLevel, sec)}
                className={`bg-slate-700 ${isAssignmentSelected(educationLevel, gradeYearLevel, sec) ? 'text-gray-500' : 'text-gray-300'}`}
              >
                {sec}
                {isAssignmentSelected(educationLevel, gradeYearLevel, sec) ? " (Already Assigned)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
      {section && (
        <div className="mt-6">
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
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
  <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
    <ul className="list-disc list-inside mb-4 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex justify-between items-center p-2 bg-slate-700 rounded">
          {editingItemId === index ? (
            <input
              type="text"
              value={editedItemValue}
              onChange={(e) => setEditedItemValue(e.target.value)}
              className="border border-slate-600 bg-slate-700 rounded px-2 py-1 mr-2 w-full text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <span className="text-gray-300">{item}</span>
          )}
          <div className="flex space-x-2">
            {editingItemId === index ? (
              <button
                onClick={() => handleEditItem(index)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditingItemId(index)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => handleRemoveItem(index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
    <div className="flex mt-4">
      <input
        type="text"
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
        className="border border-slate-600 bg-slate-700 rounded px-2 py-1 flex-grow mr-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
        placeholder={`Add new ${title.toLowerCase().replace('available ', '')}`}
      />
      <button
        onClick={handleAddItem}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
      >
        Add
      </button>
    </div>
  </div>
);

export const SchedulesList = ({ schedules }) => {
  if (!schedules || schedules.length === 0) {
    return <p className="text-gray-500">No schedules assigned.</p>;
  }

  return (
    <div className="space-y-3">
      {schedules.map(schedule => (
        <div key={schedule._id} className="p-4 bg-slate-700 rounded-lg shadow">
          <h4 className="font-semibold text-gray-200">
            {schedule.subjectId?.name || 'N/A'} ({schedule.subjectId?.code || 'N/A'})
          </h4>
          <p className="text-sm text-gray-400">
            Section: {schedule.section}
          </p>
          <p className="text-sm text-gray-400">
            Grade/Year Level: {schedule.gradeYearLevel} ({schedule.educationLevel})
          </p>
          <p className="text-sm text-gray-400">
            Day: {Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek.join(', ') : schedule.dayOfWeek}
          </p>
          <p className="text-sm text-gray-400">
            Time: {schedule.startTime} - {schedule.endTime}
          </p>
          <p className="text-sm text-gray-400">
            Semester: {schedule.semester}
          </p>
        </div>
      ))}
    </div>
  );
};