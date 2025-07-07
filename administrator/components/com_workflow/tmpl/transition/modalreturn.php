<?php
defined('_JEXEC') or die;
?>
<script type="text/javascript">
    if (window.parent && window.parent.Joomla && window.parent.Joomla.Modal) {
        window.parent.Joomla.Modal.getCurrent().close();
        // Optionally, trigger a parent event or callback here
        // window.parent.WorkflowGraph?.Event?.fire?.('onTransitionSaved', { id: <?php echo (int) ($this->item->id ?? 0); ?> });
    }
</script>
