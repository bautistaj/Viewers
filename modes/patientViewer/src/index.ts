import { ToolbarService, utils } from '@ohif/core';
import initToolGroups from './initToolGroups';
import toolbarButtons from './toolbarButtons';
import { id } from './id';

const { TOOLBAR_SECTIONS } = ToolbarService;
const { structuredCloneWithFunctions } = utils;

export const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
};

const ohif = {
  layout: '@ohif/extension-default.layoutTemplateModule.viewerLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  thumbnailList: '@ohif/extension-default.panelModule.seriesList',
};

const cornerstone = {
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
};

export const toolbarSections = {
  [TOOLBAR_SECTIONS.primary]: ['WindowLevel', 'Pan', 'Zoom', 'Reset'],
  [TOOLBAR_SECTIONS.viewportActionMenu.topLeft]: [],
  [TOOLBAR_SECTIONS.viewportActionMenu.topRight]: [],
  [TOOLBAR_SECTIONS.viewportActionMenu.bottomLeft]: [],
  [TOOLBAR_SECTIONS.viewportActionMenu.bottomMiddle]: [],
};

export const patientLayout = {
  id: ohif.layout,
  props: {
    leftPanels: [ohif.thumbnailList],
    leftPanelResizable: true,
    rightPanels: [],
    rightPanelClosed: true,
    viewports: [
      {
        namespace: cornerstone.viewport,
        displaySetsToDisplay: [ohif.sopClassHandler],
      },
    ],
    // Header overrides — ocultan flechas, paciente y engrane
    isReturnEnabled: false,
    showPatientInfo: false,
    showMenuOptions: false,
  },
};

export const patientRoute = {
  path: 'patient-viewer',
  layoutTemplate() {
    return structuredCloneWithFunctions(this.layoutInstance);
  },
  layoutInstance: patientLayout,
};

export function onModeEnter({ servicesManager, extensionManager, commandsManager }) {
  document.body.classList.add('patient-viewer-mode');

  const { toolbarService, toolGroupService } = servicesManager.services;

  initToolGroups(extensionManager, toolGroupService, commandsManager);

  toolbarService.register(this.toolbarButtons);

  for (const [key, section] of Object.entries(this.toolbarSections)) {
    toolbarService.updateSection(key, section as string[]);
  }
}

export function onModeExit({ servicesManager }) {
  document.body.classList.remove('patient-viewer-mode');

  const {
    toolGroupService,
    syncGroupService,
    cornerstoneViewportService,
    uiDialogService,
    uiModalService,
  } = servicesManager.services;

  uiDialogService.hideAll();
  uiModalService.hide();
  toolGroupService.destroy();
  syncGroupService.destroy();
  cornerstoneViewportService.destroy();
}

export const modeInstance = {
  id,
  routeName: 'patient-viewer',
  displayName: 'Patient Viewer',
  _activatePanelTriggersSubscriptions: [],
  toolbarSections,
  toolbarButtons,
  onModeEnter,
  onModeExit,
  validationTags: { study: [], series: [] },
  isValidMode: () => ({ valid: true }),
  routes: [patientRoute],
  extensions: extensionDependencies,
  hangingProtocol: 'default',
  sopClassHandlers: [ohif.sopClassHandler],
};

export function modeFactory({ modeConfiguration } = {}) {
  return modeInstance;
}

const mode = {
  id,
  modeFactory,
  modeInstance,
  extensionDependencies,
};

export default mode;
export { initToolGroups, toolbarButtons };
