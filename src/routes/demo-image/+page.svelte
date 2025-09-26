<script lang="ts">
	import { optimize } from '$lib/image';
</script>

<img srcset={optimize('/galleries/salon/1.jpg')} alt="test" />
