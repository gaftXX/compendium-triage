// Firestore Query Service - Integrates database queries with AI orchestration

import { collection, collectionGroup, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getFirestoreInstance } from '../renderer/src/services/firebase/config';

export interface QueryResult {
  success: boolean;
  data?: any[];
  count?: number;
  error?: string;
}

export class FirestoreQueryService {
  private static instance: FirestoreQueryService;

  private constructor() {}

  public static getInstance(): FirestoreQueryService {
    if (!FirestoreQueryService.instance) {
      FirestoreQueryService.instance = new FirestoreQueryService();
    }
    return FirestoreQueryService.instance;
  }

  /**
   * Count offices in the database (uses collection group query for hierarchical structure)
   */
  public async countOffices(): Promise<QueryResult> {
    try {
      const db = getFirestoreInstance();
      // Use collection group query to search across all subcollections
      const officesGroupRef = collectionGroup(db, 'offices');
      const snapshot = await getDocs(officesGroupRef);
      
      return {
        success: true,
        count: snapshot.size,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error counting offices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Count projects in the database (uses collection group query for hierarchical structure)
   */
  public async countProjects(): Promise<QueryResult> {
    try {
      const db = getFirestoreInstance();
      // Use collection group query to search across all subcollections
      const projectsGroupRef = collectionGroup(db, 'projects');
      const snapshot = await getDocs(projectsGroupRef);
      
      return {
        success: true,
        count: snapshot.size,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error counting projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Count regulations in the database
   */
  public async countRegulations(): Promise<QueryResult> {
    try {
      const db = getFirestoreInstance();
      const regulationsRef = collection(db, 'regulations');
      const snapshot = await getDocs(regulationsRef);
      
      return {
        success: true,
        count: snapshot.size,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error counting regulations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all offices with basic info (uses collection group query for hierarchical structure)
   */
  public async getOffices(): Promise<QueryResult> {
    try {
      const db = getFirestoreInstance();
      // Use collection group query to search across all subcollections
      const officesGroupRef = collectionGroup(db, 'offices');
      const q = query(officesGroupRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      const offices = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        location: doc.data().location,
        employeeCount: doc.data().employeeCount
      }));
      
      return {
        success: true,
        data: offices,
        count: offices.length
      };
    } catch (error) {
      console.error('Error getting offices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all projects with basic info (uses collection group query for hierarchical structure)
   */
  public async getProjects(): Promise<QueryResult> {
    try {
      const db = getFirestoreInstance();
      // Use collection group query to search across all subcollections
      const projectsGroupRef = collectionGroup(db, 'projects');
      const q = query(projectsGroupRef, orderBy('projectName'));
      const snapshot = await getDocs(q);
      
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().projectName,
        status: doc.data().status,
        budget: doc.data().financial?.budget
      }));
      
      return {
        success: true,
        data: projects,
        count: projects.length
      };
    } catch (error) {
      console.error('Error getting projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all regulations with basic info
   */
  public async getRegulations(): Promise<QueryResult> {
    try {
      const db = getFirestoreInstance();
      const regulationsRef = collection(db, 'regulations');
      const q = query(regulationsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      
      const regulations = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        jurisdiction: doc.data().jurisdiction,
        effectiveDate: doc.data().effectiveDate
      }));
      
      return {
        success: true,
        data: regulations,
        count: regulations.length
      };
    } catch (error) {
      console.error('Error getting regulations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<QueryResult> {
    try {
      const [officesResult, projectsResult, regulationsResult] = await Promise.all([
        this.countOffices(),
        this.countProjects(),
        this.countRegulations()
      ]);

      return {
        success: true,
        data: {
          offices: officesResult.count || 0,
          projects: projectsResult.count || 0,
          regulations: regulationsResult.count || 0,
          total: (officesResult.count || 0) + (projectsResult.count || 0) + (regulationsResult.count || 0)
        }
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default FirestoreQueryService;