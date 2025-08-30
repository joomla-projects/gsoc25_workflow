<?php

/**
 * @package     Joomla.Site
 * @subpackage  Layout
 *
 * @copyright   (C) 2025 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

$data = $displayData;
$wa   = Factory::getApplication()->getDocument()->getWebAssetManager();
$wa->useScript('joomla.dialog-autocreate');
$popupId = 'workflow-graph-modal-content';
$popupOptions = json_encode([
    'src'             => '#' . $popupId,
    'height'          => 'fit-content',
    'textHeader'      => Text::_('COM_WORKFLOW_GRAPH'),
    'preferredParent' => 'body',
    'modal'           => true,
]);
?>
<div class="align-center text-center btns mt-3">
    <button type="button" class="btn btn-primary px-3 py-2" data-joomla-dialog="<?php echo htmlspecialchars($popupOptions, ENT_QUOTES, 'UTF-8'); ?>">
        <span class="fa fa-diagram-project" aria-hidden="true"></span>
    </button>
    <div role="tooltip" id="tip-graph">
        <?php echo Text::_('COM_WORKFLOW_GRAPH'); ?>
    </div>
</div>