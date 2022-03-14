import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// @ts-ignore
import FireStoreParser from 'firestore-parser';
import { map } from 'rxjs';
import { FIREBASE_API_CONFIG, FirebaseAPIConfig } from './ngx-firebase-api.module';

@Injectable({ providedIn: 'root' })
export class NgxFirebaseApiService {

  private baseUrl = 'https://firestore.googleapis.com/v1/projects';
  private projectId = '';

  constructor(private http: HttpClient, @Inject(FIREBASE_API_CONFIG) private config: FirebaseAPIConfig) {
    if (config) {
      console.log(this.config);
      this.baseUrl = this.config.baseUrl || this.baseUrl;
      this.projectId = this.config.projectId || this.projectId;
    } else console.log('sem config');
  }

  private getFieldType(value: any) {
    if (typeof value === 'boolean') return 'booleanValue'
    if (typeof value === 'string') return 'stringValue'
    if (!isNaN(value)) return 'integerValue'
    if (value instanceof Array) return 'arrayValue'
    return 'stringValue'
  }

  private getFieldValue(value: any): any {
    if (value instanceof Array) return { values: value.map(v => ({ [this.getFieldType(v)]: this.getFieldValue(v) })) }
    return value
  }

  /**
   * Changes the default Firestore API endpoint URL.
   * @param {string} url
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Change your Firebase project ID at runtime.
   * @param {string} id
   */
  setProjectId(id: string): void {
    this.projectId = id;
  }

  /**
   * List items in a collection
   * @param {string} collectionPath The collection can be a root-level collection or a sub-collection within any object. Example: 'users/_userID_/messages'
   * @param args An object with the parameters needed to configure the request. If no objects are provided, the total item listing will be returned, without any filters applied. See the allowed fields below.
   * @returns {Observable<any[]>}
   *
   * @example To use a WHERE filter, the configuration object must contain a where attribute in array of arrays format, following this pattern [FIELD_NAME, OPERATION, VALUE]:
   * list('users', { where: [ ['active', '==', true], ['email', '==', 'same@wehere.com'] ]})
   *
   * @example To choose which fields the query should return, use the select attribute passing an array with the names of the fields as they are in the database:
   * list('users', { select: ['name', 'email', 'active'] })
   *
   * @example To order a query, pass the orderBy attribute with the name of the field to be ordered. By default the ordering is ascending, to change the order also pass the direction attribute:
   * list('users', { orderBy: 'name' })
   * list('users', { orderBy: 'name', direction: 'desc' })
   *
   * @example To limit the number of results you must pass the limit attribute with an integer value:
   * list('users', { limit: 50 })
   *
   * @example You can pass the offset attribute to skip a number of records:
   * list('users', { offset: 50 })
   *
   * @example You can also combine limit and offset to make pagination:
   * list('users', { limit: 50, offset: 50 })
   */
  list(collectionPath: string, args: any) {
    const s = collectionPath.split('/')
    const c = s.pop()
    const u = `${this.baseUrl}/${this.projectId}/databases/(default)/documents${s.length ? '/' + s.join('/') : ''}:runQuery`
    const ops = {
      '==': 'EQUAL',
      '!=': 'NOT_EQUAL',
      '<': 'LESS_THAN',
      '<=': 'LESS_THAN_OR_EQUAL',
      '>': 'GREATER_THAN',
      '>=': 'GREATER_THAN_OR_EQUAL',
      'array-contains': 'ARRAY_CONTAINS',
      'in': 'IN'
    }
    const directions = {
      asc: 'ASCENDING',
      ASC: 'ASCENDING',
      desc: 'DESCENDING',
      DESC: 'DESCENDING'
    }
    const structuredQuery: any = { from: { collectionId: c } }

    if (args) {
      if (args.group) structuredQuery.from.allDescendants = true
      if (args.select && args.select instanceof Array && args.select.length)
        { // @ts-ignore
          structuredQuery['select'] = { fields: args.select.map(s => ({ fieldPath: s })) }
        }
      if (args.where && args.where instanceof Array && args.where.length)
        { // @ts-ignore
          structuredQuery['where'] = { compositeFilter: { filters: args.where.map(w => ({ fieldFilter: { field: { fieldPath: w[0] }, op: ops[w[1]], value: { [this.getFieldType(w[2])]: this.getFieldValue(w[2]) } } })), op: 'AND' } }
        }
      if (args.orderBy)
        { // @ts-ignore
          structuredQuery['orderBy'] = { field: { fieldPath: args.orderBy }, direction: args.direction ? directions[args.direction] : directions.asc }
        }
      if (args.limit) structuredQuery['limit'] = +args.limit
      if (args.offset) structuredQuery['offset'] = +args.offset
    }

    return this.http.post(u, { structuredQuery })
      // @ts-ignore
      .pipe(map((_a: any[]) => (_a.length ? _a.filter(r => r.document) : []).map(_r => (_r.document && !_r.document.fields) ? false : ({ ...FireStoreParser(_r.document.fields, _r.document.name || null), id: _r.document.name.split('/').pop() })).filter(_r => _r)))
  }

  /**
   * Query an object in a collection by its ID
   * @param {string} collectionPath The collection can be a root-level collection or a sub-collection within any object. Example: 'users/_userID_/messages'
   * @param {string} id
   * @returns {Observable<any>}
   *
   * @example
   * get('users', 'xyz')
   */
  get(collectionPath: string, id: string) {
    return this.http.get(`${this.baseUrl}/${this.projectId}/databases/(default)/documents/${collectionPath}/${id}`).pipe(map((res: any) => res.fields ? FireStoreParser(res.fields) : null))
  }
}
