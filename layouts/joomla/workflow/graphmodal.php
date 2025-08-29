<?php
defined('_JEXEC') or die;


use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

$app = Factory::getApplication();
$wa = $app->getDocument()->getWebAssetManager();
$registry = $app->getUserState('registry');
$wa->getRegistry()->addExtensionRegistryFile('com_workflow');
// add transitions registry
$wa->getRegistry()->addExtensionRegistryFile('com_workflow.transitions');

$wa->useStyle('com_workflow.workflowgraphclient');
$script = $wa->getAsset('script', name: 'com_workflow.workflowgraphclient')->getUri(true);

$workflowId = $app->getUserState('com_workflow.transitions.filter.workflow_id', 0);
?>
<template id="workflow-graph-modal-content">

<div class="p-3">
    <section
        class="d-flex flex-wrap align-items-center justify-content-between"
        aria-labelledby="workflow-main-title"
    >
        <div class="col-md-6 d-flex flex-column">
            <h3 id="workflow-main-title" class="mb-2"></h3>
            <dl class="d-flex align-items-center flex-wrap mb-0" aria-label="Workflow Details">
                <dt class="visually-hidden">Status:</dt>
                <dd class="me-3 mb-1 d-flex mb-0">
                    <span class="badge" role="status"></span>
                </dd>
                <dt class="visually-hidden">Stage Count:</dt>
                <dd class="me-3 mb-1 d-flex mb-0">
                    <span></span>
                </dd>
                <dt class="visually-hidden">Transition Count:</dt>
                <dd class="me-3 mb-1 d-flex mb-0">
                    <span></span>
                </dd>
            </dl>
        </div>
    </section>
    <div id="workflow-graph">
        <div id="workflow-container" data-workflow-id="<?php echo (int) $workflowId; ?>">
            <div id="graph">
                <div id="stages"></div>
                <svg id="connections"></svg>
            </div>
            <div class="zoom-controls">
                <div
            ref="controlsContainer"
            class="custom-controls z-10"
            role="group"
            aria-labelledby="canvas-controls-title"
          >
            <h2 id="canvas-controls-title" class="visually-hidden">Canvas View Controls</h2>

            <ul class="d-flex flex-column gap-1 list-unstyled mb-0" role="group">
              <li>
                <button
                  class="zoom-btn zoom-in"
                  tabindex="0"
                  type="button"
                  aria-label="Zoom in"
                  title="Zoom in (+ key)"
                >
                  <span class="icon icon-plus" aria-hidden="true" />
                  <span class="visually-hidden">Zoom In</span>
                </button>
              </li>
              <li>
                <button
                  class="zoom-btn zoom-out"
                  tabindex="0"
                  type="button"
                  aria-label="Zoom out"
                  title="Zoom out (- key)"
                  @click="zoomOut"
                  @keydown.enter="zoomOut"
                  @keydown.space.prevent="zoomOut"
                >
                  <span class="icon icon-minus" aria-hidden="true" />
                  <span class="visually-hidden">Zoom Out</span>
                </button>
              </li>
              <li>
                <button
                  class="zoom-btn fit-screen"
                  tabindex="0"
                  type="button"
                  aria-label="Fit view"
                  title="Fit view (F key)"
                  @click="customFitView"
                  @keydown.enter="customFitView"
                  @keydown.space.prevent="customFitView"
                >
                  <span class="icon icon-expand" aria-hidden="true" />
                  <span class="visually-hidden">Fit View</span>
                </button>
              </li>
            </ul>
          </div>
            </div>
        </div>
    </div>
</div>
<script type="module" src="<?php echo $script ?>"></script>
</template>
