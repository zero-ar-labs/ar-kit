import { renderDiagnostic } from '@zero-ar/contracts';
export function refuseCommand(diagnostic) {
    console.error(renderDiagnostic(diagnostic));
    return 1;
}
