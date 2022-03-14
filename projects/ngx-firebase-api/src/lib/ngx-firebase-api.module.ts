import { HttpClientModule } from '@angular/common/http';
import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

export interface FirebaseAPIConfig {
  projectId: string;
  baseUrl?: string;
}

export const FIREBASE_API_CONFIG = new InjectionToken<FirebaseAPIConfig>(
  'FIREBASE_API_CONFIG'
);

@NgModule({
  declarations: [],
  imports: [HttpClientModule],
  exports: [],
})
export class NgxFirebaseApiModule {
  static forRoot(firebaseAPIConfig: FirebaseAPIConfig): ModuleWithProviders<NgxFirebaseApiModule> {
    return {
      ngModule: NgxFirebaseApiModule,
      providers: [
        {
          provide: FIREBASE_API_CONFIG,
          useValue: firebaseAPIConfig
        }
      ]
    };
  }
}
