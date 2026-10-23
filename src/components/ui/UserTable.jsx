import { Users } from "lucide-react";
import UserTableRow from "./UserTableRow";

// 🏢 ORGANISM: Master User Table Component
export const UserTable = ({ users = [], onActionClick, onEditClick, activeView }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30">
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Date Joined
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {users.length > 0 ? (
            users.map((user) => (
              <UserTableRow
                key={user.uid || user.id}
                user={user}
                onEditClick={onEditClick}
                onActionClick={onActionClick}
              />
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-8 py-20 text-center">
                <div className="flex flex-col items-center justify-center mx-auto space-y-4">
                  <div className="p-6 bg-surface-container-low rounded-3xl text-outline border border-outline-variant/20">
                    <Users size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">
                      No {activeView}s Found
                    </h3>
                    <p className="text-sm text-on-surface-variant font-medium mt-1 leading-relaxed">
                      Your search or filter criteria didn&apos;t match any system profiles.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
