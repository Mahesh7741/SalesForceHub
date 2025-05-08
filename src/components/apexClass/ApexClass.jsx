import { useState, useEffect, useRef } from 'react';

export default function ApexClassExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editedCode, setEditedCode] = useState('');
  const [authData, setAuthData] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'detail', or 'edit'
  const [saving, setSaving] = useState(false);
  
  // Add a ref for the textarea to maintain focus
  const codeEditorRef = useRef(null);

  useEffect(() => {
    // Get auth data from localStorage
    const sfAuthData = localStorage.getItem('sfAuthData');

    if (sfAuthData) {
      const parsedAuthData = JSON.parse(sfAuthData);
      setAuthData(parsedAuthData);
      // Fetch classes immediately after authentication data is loaded
      fetchAllClasses(parsedAuthData);
    } else {
      setError('Salesforce authentication data not found. Please login first.');
    }
  }, []);

  // Focus the editor when switching to edit view
  useEffect(() => {
    if (view === 'edit' && codeEditorRef.current) {
      // Set focus and move cursor to end
      const textarea = codeEditorRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [view]);

  const fetchAllClasses = async (auth) => {
    if (!auth) {
      setError('Missing authentication data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apexClasses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sfAuthData: auth
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch classes');
      }

      setAllClasses(data.classes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (className) => {
    if (!authData) {
      setError('Missing authentication data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/apexClass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className,
          sfAuthData: authData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch class details');
      }

      setSelectedClass(data.class);
      setEditedCode(data.class.body);
      setView('detail');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateApexClass = async () => {
    if (!authData || !selectedClass) {
      setError('Missing authentication data or class information');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/updateApexClass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass.id,
          classBody: editedCode,
          sfAuthData: authData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Display a more detailed error message if available
        let errorMessage = data.error || 'Failed to update Apex class';
        
        // If there are compiler errors or specific error messages, show them
        if (data.details) {
          if (data.details.errorMsg) {
            errorMessage += `: ${data.details.errorMsg}`;
          }
          
          if (data.details.compilerErrors && typeof data.details.compilerErrors === 'string' 
              && data.details.compilerErrors !== 'No compiler errors available') {
            errorMessage += `\n\nCompiler errors: ${data.details.compilerErrors}`;
          }
          
          // If it's a raw error string
          if (data.details.rawError) {
            errorMessage += `\n\n${data.details.rawError}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Update the selected class with the new body
      setSelectedClass({
        ...selectedClass,
        body: editedCode,
        lastModifiedDate: new Date().toISOString()
      });
      
      setSuccessMessage('Apex class updated successfully!');
      setView('detail');
      
      // Refresh the class details and list to get latest metadata
      fetchClassDetails(selectedClass.name);
      fetchAllClasses(authData);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredClasses = allClasses.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackToList = () => {
    setView('list');
    setSelectedClass(null);
    setEditedCode('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleEditClass = () => {
    setEditedCode(selectedClass.body);
    setView('edit');
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setView('detail');
    setEditedCode(selectedClass.body);
    setError(null);
  };

  // Optimized code change handler that doesn't cause focus issues
  const handleCodeChange = (e) => {
    setEditedCode(e.target.value);
  };

  const ClassListView = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Apex Classes</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search classes..."
              className="p-2 border rounded mr-2"
            />
            <button
              onClick={() => fetchAllClasses(authData)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClasses.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{cls.name}</div>
                  {cls.namespacePrefix && (
                    <div className="text-sm text-gray-500">Namespace: {cls.namespacePrefix}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.apiVersion}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    cls.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cls.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(cls.lastModifiedDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => fetchClassDetails(cls.name)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredClasses.length === 0 && !loading && (
        <div className="p-4 text-center text-gray-500">
          No classes found
        </div>
      )}
    </div>
  );

  const ClassDetailView = () => {
    if (!selectedClass) return null;
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <button
              onClick={handleBackToList}
              className="mr-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              ← Back
            </button>
            <span className="text-xl font-semibold">{selectedClass.name}</span>
          </div>
          <div>
            <button
              onClick={handleEditClass}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
            >
              Edit Class
            </button>
          </div>
        </div>
        
        {successMessage && (
          <div className="mx-4 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded">
              <strong className="block text-sm text-gray-500">API Version</strong>
              <span>{selectedClass.apiVersion}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong className="block text-sm text-gray-500">Status</strong>
              <span className={selectedClass.status === 'Active' ? 'text-green-600' : 'text-red-600'}>
                {selectedClass.status}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong className="block text-sm text-gray-500">Created Date</strong>
              <span>{formatDate(selectedClass.createdDate)}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong className="block text-sm text-gray-500">Last Modified</strong>
              <span>{formatDate(selectedClass.lastModifiedDate)}</span>
            </div>
            {selectedClass.lengthWithoutComments && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-sm text-gray-500">Length (without comments)</strong>
                <span>{selectedClass.lengthWithoutComments} characters</span>
              </div>
            )}
            {selectedClass.bodyCrc && (
              <div className="bg-gray-50 p-3 rounded">
                <strong className="block text-sm text-gray-500">Body CRC</strong>
                <span>{selectedClass.bodyCrc}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-gray-700">Class Body</h3>
            <div className="relative">
              <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96 text-sm">
                {selectedClass.body}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedClass.body);
                  alert('Code copied to clipboard!');
                }}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClassEditView = () => {
    if (!selectedClass) return null;
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <button
              onClick={handleCancelEdit}
              className="mr-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <span className="text-xl font-semibold">Editing: {selectedClass.name}</span>
          </div>
          <div>
            <button
              onClick={updateApexClass}
              disabled={saving}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded overflow-auto max-h-60">
            <div className="font-bold mb-1">Error:</div>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}
        
        {saving && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>Updating Apex class... This may take a few moments.</span>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Edit Apex Class Code
              </label>
              <div className="text-xs text-gray-500">
                <span className="font-semibold">API Version:</span> {selectedClass.apiVersion}
              </div>
            </div>
            <textarea
              ref={codeEditorRef}
              value={editedCode}
              onChange={handleCodeChange}
              className="w-full h-96 p-4 font-mono text-sm border rounded focus:ring-blue-500 focus:border-blue-500 tab-size-4"
              spellCheck="false"
            />
            <div className="text-right mt-1 text-xs text-gray-500">
              {editedCode.length} characters
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Apex Class Explorer</h1>

      {!authData ? (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded mb-4">
          Please login to Salesforce first
        </div>
      ) : (
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded mb-4">
            <div className="text-sm text-blue-700">
              <strong>Connected to:</strong> {authData.instanceUrl}
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && view === 'list' && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
              {error}
            </div>
          )}
          
          {!loading && view === 'list' && <ClassListView />}
          {!loading && view === 'detail' && <ClassDetailView />}
          {view === 'edit' && <ClassEditView />}
        </div>
      )}
    </div>
  );
}