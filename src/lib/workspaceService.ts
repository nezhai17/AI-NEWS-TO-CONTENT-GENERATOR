import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { Workspace, TeamMember, useStore } from '@/store/useStore';

export const workspaceService = {
  createWorkspace: async (userId: string, name: string, email?: string) => {
    const wsRef = doc(collection(db, 'workspaces'));
    const workspace: Workspace = {
      id: wsRef.id,
      name,
      ownerId: userId,
      memberIds: [userId]
    };

    try {
      await setDoc(wsRef, {
        ...workspace,
        createdAt: Timestamp.now(),
      });

      // Add owner as member
      const memberRef = doc(collection(db, `workspaces/${wsRef.id}/members`), userId);
      await setDoc(memberRef, {
        userId,
        email: email || '',
        role: 'owner',
        joinedAt: Timestamp.now()
      });

      return workspace;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'workspaces');
    }
  },

  getUserWorkspaces: (userId: string, callback: (workspaces: Workspace[]) => void) => {
    // Neural Discovery Pattern: Look for workspaces where user is the owner OR a listed member
    // Using simple query for now, in scaled enterprise we use composite or membership documents
    const q = query(collection(db, 'workspaces'), where('memberIds', 'array-contains', userId));
    
    return onSnapshot(q, (snap) => {
      const workspaces = snap.docs.map(doc => doc.data() as Workspace);
      callback(workspaces);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'workspaces');
      callback([]); // Return empty list on permission error to prevent crash
    });
  },

  subscribeToMembers: (workspaceId: string, callback: (members: TeamMember[]) => void) => {
    const path = `workspaces/${workspaceId}/members`;
    return onSnapshot(collection(db, path), (snap) => {
      const members = snap.docs.map(doc => doc.data() as TeamMember);
      callback(members);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
  },

  logActivity: async (userId: string, workspaceId: string, action: string, resourceType: string, resourceId: string) => {
    try {
      await addDoc(collection(db, `workspaces/${workspaceId}/audit_logs`), {
        userId,
        workspaceId,
        action,
        resourceType,
        resourceId,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error("Audit log failed:", error);
    }
  }
};
