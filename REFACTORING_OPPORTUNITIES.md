# Opportunità di Refactoring e Miglioramenti del Codice Angular

## 🔴 Critici (Memory Leaks e Bug Potenziali)

### 1. **Memory Leaks: Subscription non gestite**
**Problema**: Molte subscription non vengono mai unsubscribed, causando memory leaks.

**File interessati**:
- `callback.component.ts` - 2 subscription non gestite
- `dashboard.component.ts` - 3 subscription non gestite
- `playlists.component.ts` - 2 subscription non gestite
- `track-management.component.ts` - 2 subscription non gestite
- `main-layout.component.ts` - 2 subscription non gestite

**Soluzione**: Usare `takeUntilDestroyed()` (Angular 16+) o `DestroyRef` per gestire automaticamente le subscription.

```typescript
// Esempio di refactoring
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

export class DashboardComponent {
  private destroyRef = inject(DestroyRef);
  
  loadTrackSummary(): void {
    this.trackService.getTrackSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({...});
  }
}
```

### 2. **ViewChild non inizializzato**
**Problema**: `DashboardComponent` usa `@ViewChild` che potrebbe non essere inizializzato quando viene usato.

**File**: `dashboard.component.ts` (linee 65-66, 84-85)

**Soluzione**: Aggiungere controlli o usare `@ViewChild` con `{ static: false }` e gestire l'inizializzazione.

```typescript
@ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

ngAfterViewInit(): void {
  if (this.dataSource) {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
```

---

## 🟡 Importanti (Type Safety e Best Practices)

### 3. **Type Safety: Uso di `any`**
**Problema**: Uso di `any` riduce la type safety.

**File interessati**:
- `track-management.component.ts:122` - `applyPreset(preset: any)`
- `api-response.model.ts:1` - `ApiResponse<T = any>`

**Soluzione**: Creare interfacce tipizzate.

```typescript
// track-management.component.ts
interface PresetRange {
  label: string;
  min: number | null;
  max: number | null;
}

applyPreset(preset: PresetRange): void {
  this.rangeForm.patchValue({
    min: preset.min,
    max: preset.max,
  });
}
```

### 4. **FormGroup non tipizzato**
**Problema**: I form non usano FormGroup tipizzati, perdendo type safety.

**File interessati**:
- `playlists.component.ts` - `playlistForm: FormGroup`
- `track-management.component.ts` - `rangeForm: FormGroup`

**Soluzione**: Usare `FormGroup<TypedFormGroup>` o `FormBuilder` con interfacce.

```typescript
interface PlaylistForm {
  playlistId: FormControl<string>;
}

playlistForm = this.fb.group<PlaylistForm>({
  playlistId: ['', [Validators.required, ...]]
});
```

### 5. **Validator non statico**
**Problema**: `rangeValidator` in `TrackManagementComponent` non è statico ma dovrebbe esserlo.

**File**: `track-management.component.ts:65`

**Soluzione**: Rendere il validator statico o spostarlo in una classe separata.

```typescript
static rangeValidator(form: AbstractControl): ValidationErrors | null {
  const min = form.get('min')?.value;
  const max = form.get('max')?.value;
  // ...
}
```

### 6. **OnInit vuoto**
**Problema**: `TrackManagementComponent` implementa `OnInit` ma non lo usa.

**File**: `track-management.component.ts:37,63`

**Soluzione**: Rimuovere `implements OnInit` e `ngOnInit()` se non necessario.

---

## 🟢 Miglioramenti (Code Quality e Performance)

### 7. **Codice duplicato: Gestione Loading/Errori**
**Problema**: Pattern ripetuto per gestire loading e errori in tutti i componenti.

**Soluzione**: Creare un helper o usare un operatore RxJS personalizzato.

```typescript
// core/utils/http-operators.ts
export function withLoading<T>(
  loadingService: LoadingService
): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    source.pipe(
      tap(() => loadingService.show()),
      finalize(() => loadingService.hide())
    );
}

// Uso
this.trackService.getTrackSummary()
  .pipe(withLoading(this.loadingService))
  .subscribe({...});
```

### 8. **HttpParams duplicato**
**Problema**: Logica ripetuta per costruire HttpParams in `TrackService`.

**File**: `track.service.ts:22-30, 49-57`

**Soluzione**: Estrarre in un metodo helper.

```typescript
private buildRangeParams(min?: number, max?: number): HttpParams {
  let params = new HttpParams();
  if (min !== undefined) {
    params = params.set('min', min.toString());
  }
  if (max !== undefined) {
    params = params.set('max', max.toString());
  }
  return params;
}
```

### 9. **Computed Signals per valori derivati**
**Problema**: `DashboardComponent` calcola `totalTracks` e `totalArtists` manualmente.

**File**: `dashboard.component.ts:47-48, 97-100`

**Soluzione**: Usare `computed()` signals per valori derivati.

```typescript
private artistsData = signal<ArtistSummary[]>([]);

totalArtists = computed(() => this.artistsData().length);
totalTracks = computed(() => 
  this.artistsData().reduce((sum, artist) => sum + artist.count, 0)
);
```

### 10. **Error Handling inconsistente**
**Problema**: Gestione errori diversa tra componenti.

**Soluzione**: Standardizzare con un interceptor o helper.

```typescript
// core/utils/error-handler.ts
export function handleHttpError(
  error: HttpErrorResponse,
  notificationService: NotificationService
): void {
  const message = error.error?.message || 'An error occurred';
  notificationService.error(message);
}
```

### 11. **BreakpointObserver subscription leak**
**Problema**: `MainLayoutComponent` ha una subscription a `breakpointObserver` che non viene mai unsubscribed.

**File**: `main-layout.component.ts:50-54`

**Soluzione**: Usare `takeUntilDestroyed()`.

```typescript
constructor(...) {
  this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(matches => {
      this.isHandset.set(matches);
    });
}
```

### 12. **Logout subscription non gestita**
**Problema**: `MainLayoutComponent.logout()` crea una subscription che non viene gestita.

**File**: `main-layout.component.ts:69`

**Soluzione**: Gestire la subscription o usare `first()` se serve solo il primo valore.

```typescript
logout(): void {
  this.authService.logout()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe();
}
```

### 13. **Magic numbers e stringhe hardcoded**
**Problema**: Valori magici sparsi nel codice.

**File interessati**:
- `dashboard.component.html:41` - `totalTracks / totalArtists`
- `playlists.component.ts:116` - `width: '460px'`
- Vari messaggi di errore hardcoded

**Soluzione**: Estrarre in costanti o file di configurazione.

```typescript
// core/constants/dialog.constants.ts
export const DIALOG_CONFIG = {
  DEFAULT_WIDTH: '400px',
  PLAYLIST_WIDTH: '460px',
} as const;
```

### 14. **Mancanza di readonly per array immutabili**
**Problema**: Array che non dovrebbero essere modificati non sono readonly.

**File interessati**:
- `playlists.component.ts:43` - `samplePlaylists`
- `track-management.component.ts:39` - `presetRanges`

**Soluzione**: Usare `readonly` o `as const`.

```typescript
readonly samplePlaylists = [
  { label: 'Discover Weekly', id: '37i9dQZF1DWXRqgorJj26U' },
  // ...
] as const;
```

### 15. **Separazione delle responsabilità**
**Problema**: I componenti gestiscono troppa logica di business.

**Soluzione**: Estrarre logica in servizi o helper.

```typescript
// helpers/dialog.helper.ts
export class DialogHelper {
  static openConfirmDialog(
    dialog: MatDialog,
    config: DialogConfig
  ): Observable<boolean> {
    return dialog.open(ConfirmDialogComponent, config)
      .afterClosed();
  }
}
```

### 16. **Mancanza di error boundaries**
**Problema**: Nessuna gestione centralizzata degli errori non gestiti.

**Soluzione**: Implementare un error handler globale.

```typescript
// core/error-handler.ts
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    // Log error and show notification
  }
}
```

---

## 📊 Priorità di Implementazione

1. **Alta Priorità** (Memory Leaks):
   - #1: Gestione subscription con `takeUntilDestroyed()`
   - #2: ViewChild initialization
   - #11: BreakpointObserver subscription
   - #12: Logout subscription

2. **Media Priorità** (Type Safety):
   - #3: Rimuovere `any`
   - #4: FormGroup tipizzati
   - #5: Validator statico

3. **Bassa Priorità** (Code Quality):
   - #7: Helper per loading/errori
   - #8: HttpParams helper
   - #9: Computed signals
   - #13: Costanti
   - #14: Readonly arrays

---

## 🛠️ Strumenti Consigliati

- **ESLint**: Per rilevare pattern problematici
- **Angular DevTools**: Per debuggare memory leaks
- **TypeScript strict mode**: Per migliorare type safety
- **RxJS ESLint Plugin**: Per rilevare subscription non gestite

