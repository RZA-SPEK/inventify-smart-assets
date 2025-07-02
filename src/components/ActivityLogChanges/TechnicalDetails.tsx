
interface TechnicalDetailsProps {
  action: string;
  oldValues: any;
  newValues: any;
}

export const TechnicalDetails = ({ action, oldValues, newValues }: TechnicalDetailsProps) => {
  return (
    <>
      {action === 'UPDATE' && oldValues && newValues && (
        <details className="cursor-pointer">
          <summary className="text-xs text-blue-600 hover:text-blue-800">
            Bekijk technische details
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-2">
            <div>
              <strong>Voor:</strong>
              <pre className="whitespace-pre-wrap break-all mt-1">
                {JSON.stringify(oldValues, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Na:</strong>
              <pre className="whitespace-pre-wrap break-all mt-1">
                {JSON.stringify(newValues, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      )}
      
      {action === 'INSERT' && newValues && (
        <details className="cursor-pointer">
          <summary className="text-xs text-blue-600 hover:text-blue-800">
            Bekijk technische details
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <strong>Gegevens:</strong>
            <pre className="whitespace-pre-wrap break-all mt-1">
              {JSON.stringify(newValues, null, 2)}
            </pre>
          </div>
        </details>
      )}
      
      {action === 'DELETE' && oldValues && (
        <details className="cursor-pointer">
          <summary className="text-xs text-blue-600 hover:text-blue-800">
            Bekijk technische details
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <strong>Verwijderde gegevens:</strong>
            <pre className="whitespace-pre-wrap break-all mt-1">
              {JSON.stringify(oldValues, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </>
  );
};
